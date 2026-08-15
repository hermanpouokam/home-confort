"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getHydratedCart, getCartTotal } from "@/lib/cart";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/mailer";
import { generateEventId } from "@/lib/meta/pixel";
import { sendCapiEvent, buildHashedUserData } from "@/lib/meta/server";

const CART_COOKIE = "hc_cart";

const orderSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  district: z.string().min(2, "Quartier requis"),
  zip: z.string().optional(),
  deliveryMode: z.enum(["standard", "express", "relay"]),
  slot: z.enum(["morning", "afternoon", "evening"]),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderFormState = {
  errors?: Partial<Record<keyof OrderFormData, string[]>>;
  message?: string;
};

export async function placeOrder(
  prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    district: formData.get("district") as string,
    zip: formData.get("zip") as string,
    deliveryMode: formData.get("deliveryMode") as string,
    slot: formData.get("slot") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Partial<Record<keyof OrderFormData, string[]>>,
      message: "Veuillez corriger les erreurs du formulaire.",
    };
  }

  const cartItems = await getHydratedCart();
  if (cartItems.length === 0) {
    return { message: "Votre panier est vide." };
  }

  // Vérifier le stock disponible pour chaque article
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return {
        message: `Stock insuffisant pour "${(item.product.name as Record<string, string>).fr ?? "ce produit"
          }". Disponible : ${item.product.stock}.`,
      };
    }
  }

  const subtotal = getCartTotal(cartItems);
  const shippingCost =
    parsed.data.deliveryMode === "express"
      ? 3000
      : parsed.data.deliveryMode === "standard"
        ? 1500
        : 0;
  const total = subtotal + shippingCost;

  const orderNumber = generateOrderNumber();

  try {
    // Créer la commande et déduire le stock dans une transaction
    await prisma.$transaction(async (tx) => {
      // Créer la commande
      await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          customer: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: parsed.data.email,
            phone: parsed.data.phone,
          },
          delivery: {
            address: parsed.data.address,
            city: parsed.data.city,
            district: parsed.data.district,
            zip: parsed.data.zip ?? "",
            mode: parsed.data.deliveryMode,
            slot: parsed.data.slot,
            notes: parsed.data.notes ?? "",
          },
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
      });

      // Déduire le stock pour chaque produit commandé
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    (await cookies()).delete(CART_COOKIE);

    // Données communes aux deux mails
    const mailPayload = {
      orderNumber,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      items: cartItems.map((item) => ({
        name:
          (item.product.name as Record<string, string>).fr ??
          (item.product.name as Record<string, string>).en ??
          "Produit",
        quantity: item.quantity,
        unitPrice: Number(item.product.price),
      })),
      total,
      deliveryAddress: parsed.data.address,
      deliveryCity: parsed.data.city,
      deliveryDistrict: parsed.data.district,
      deliveryMode: parsed.data.deliveryMode,
      deliverySlot: parsed.data.slot,
      notes: parsed.data.notes,
    };

    // Mail client (non-bloquant)
    sendOrderConfirmation({ to: parsed.data.email, ...mailPayload })
      .catch((err) => console.error("Erreur mail client:", err));

    // Mail admin (non-bloquant)
    sendAdminOrderNotification(mailPayload)
      .catch((err) => console.error("Erreur mail admin:", err));
  } catch (err) {
    console.error("Order creation failed:", err);
    return { message: "Une erreur est survenue. Veuillez réessayer." };
  }

  // ── Purchase via Conversions API ─────────────────────────────────────────
  // Exécuté après la création réussie de la commande
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      undefined;
    const userAgent = hdrs.get("user-agent") ?? undefined;
    const fbc = (await cookies()).get("_fbc")?.value;
    const fbp = (await cookies()).get("_fbp")?.value;

    const eventId = generateEventId();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    await sendCapiEvent({
      eventName: "Purchase",
      eventId,
      eventSourceUrl: `${siteUrl}/checkout`,
      userData: buildHashedUserData({
        email: parsed.data.email,
        phone: parsed.data.phone,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        city: parsed.data.city,
        country: "cm", // Cameroun
        ip,
        userAgent,
        fbc,
        fbp,
      }),
      customData: {
        currency: "XAF",
        value: total,
        order_id: orderNumber,
        content_ids: cartItems.map((i) => i.productId),
        contents: cartItems.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: i.product.price,
        })),
        num_items: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      },
    });
  } catch (err) {
    // Ne jamais laisser Meta planter la redirection post-achat
    console.error("[Meta CAPI] Purchase event failed silently:", err);
  }


  redirect(`/fr/order-success?ref=${orderNumber}`);
}

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return session;
}

async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Order Actions
export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) return { error: "Statut invalide" };
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
  });
  revalidatePath("/admin/orders");
  return { success: true };
}

// Product Actions
const productSchema = z.object({
  nameFr: z.string().min(2, "Nom FR requis"),
  nameEn: z.string().min(2, "Nom EN requis"),
  descriptionFr: z.string().min(10, "Description FR requise"),
  descriptionEn: z.string().min(10, "Description EN requise"),
  price: z.coerce.number().positive("Prix requis"),
  stock: z.coerce.number().int().min(0, "Stock requis"),
  categoryId: z.string().min(1, "Catégorie requise"),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  images: z.string().optional(),
  // Promo
  hasPromo: z.boolean().optional(),
  originalPrice: z.coerce.number().positive().optional().or(z.literal("")),
  promoEndsAt: z.string().optional(),
});

export async function createProduct(prevState: unknown, formData: FormData) {
  await requireAdmin();

  const raw = {
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    images: formData.get("images"),
    hasPromo: formData.get("hasPromo") === "on",
    originalPrice: formData.get("originalPrice") || "",
    promoEndsAt: formData.get("promoEndsAt") || "",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { nameFr, nameEn, descriptionFr, descriptionEn, price, stock, categoryId, featured, active, images, hasPromo, originalPrice, promoEndsAt } = parsed.data;

  // Validation promo : si promo activée, l'ancien prix doit être supérieur au prix promo
  if (hasPromo && originalPrice && Number(originalPrice) <= price) {
    return { errors: { originalPrice: ["L'ancien prix doit être supérieur au prix promotionnel"] } };
  }

  const slug = nameFr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const imageList = images
    ? images.split(",").map((s) => s.trim()).filter(Boolean)
    : [`https://picsum.photos/seed/${slug}/800/600`];

  try {
    await prisma.product.create({
      data: {
        slug: `${slug}-${Date.now()}`,
        name: { fr: nameFr, en: nameEn },
        description: { fr: descriptionFr, en: descriptionEn },
        price,
        stock,
        categoryId,
        featured: featured ?? false,
        active: active ?? true,
        images: imageList,
        originalPrice: hasPromo && originalPrice ? Number(originalPrice) : null,
        promoEndsAt: hasPromo && promoEndsAt ? new Date(promoEndsAt) : null,
      },
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return { message: "Erreur lors de la création du produit." };
  }

  revalidateTag("products");
  revalidatePath("/admin/products");
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function updateProduct(productId: string, prevState: unknown, formData: FormData) {
  await requireAdmin();

  const raw = {
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    images: formData.get("images"),
    hasPromo: formData.get("hasPromo") === "on",
    originalPrice: formData.get("originalPrice") || "",
    promoEndsAt: formData.get("promoEndsAt") || "",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { nameFr, nameEn, descriptionFr, descriptionEn, price, stock, categoryId, featured, active, images, hasPromo, originalPrice, promoEndsAt } = parsed.data;

  if (hasPromo && originalPrice && Number(originalPrice) <= price) {
    return { errors: { originalPrice: ["L'ancien prix doit être supérieur au prix promotionnel"] } };
  }

  const imageList = images
    ? images.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: { fr: nameFr, en: nameEn },
        description: { fr: descriptionFr, en: descriptionEn },
        price,
        stock,
        categoryId,
        featured: featured ?? false,
        active: active ?? true,
        ...(imageList && { images: imageList }),
        originalPrice: hasPromo && originalPrice ? Number(originalPrice) : null,
        promoEndsAt: hasPromo && promoEndsAt ? new Date(promoEndsAt) : null,
      },
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return { message: "Erreur lors de la mise à jour du produit." };
  }

  revalidateTag("products");
  revalidatePath("/admin/products");
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function toggleProductActive(productId: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidateTag("products");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { active: false } });
  revalidateTag("products");
  revalidatePath("/admin/products");
  return { success: true };
}

// Promo Actions
export async function removePromo(productId: string) {
  await requireAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { originalPrice: null, promoEndsAt: null },
  });
  revalidateTag("products");
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/products");
  return { success: true };
}

// User Actions
const adminSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe requis (8 chars min)"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export async function createAdmin(prevState: unknown, formData: FormData) {
  await requireSuperAdmin();
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };
  const parsed = adminSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { errors: { email: ["Cet email est déjà utilisé"] } };

  const count = await prisma.admin.count();
  if (count >= 5) return { error: "Maximum 5 administrateurs" };

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await prisma.admin.create({
    data: { email: parsed.data.email, password: hashed, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleAdminActive(adminId: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.admin.update({ where: { id: adminId }, data: { active } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateAdminRole(adminId: string, role: "ADMIN" | "SUPER_ADMIN") {
  await requireSuperAdmin();
  await prisma.admin.update({ where: { id: adminId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

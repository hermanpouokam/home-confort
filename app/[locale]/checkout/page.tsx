import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getHydratedCart, getCartTotal } from "@/lib/cart";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { sendCapiEvent, buildHashedUserData } from "@/lib/meta/server";
import { generateEventId } from "@/lib/meta/pixel";
import InitiateCheckoutTracker from "@/components/meta/InitiateCheckoutTracker";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Finaliser ma commande" };

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const items = await getHydratedCart(locale);

  if (items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const total = getCartTotal(items);

  const cartForClient = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: {
      name: item.product.name,
      price: item.product.price,
      images: item.product.images,
    },
  }));

  // ── InitiateCheckout via Conversions API (serveur) ──────────────────────
  const eventId = generateEventId();
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    undefined;
  const userAgent = hdrs.get("user-agent") ?? undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  void sendCapiEvent({
    eventName: "InitiateCheckout",
    eventId,
    eventSourceUrl: `${siteUrl}/${locale}/checkout`,
    userData: buildHashedUserData({ ip, userAgent }),
    customData: {
      currency: "XAF",
      value: total,
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
      content_ids: items.map((i) => i.productId),
      contents: items.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        item_price: i.product.price,
      })),
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <InitiateCheckoutTracker
        eventId={eventId}
        total={total}
        numItems={items.reduce((acc, i) => acc + i.quantity, 0)}
        contentIds={items.map((i) => i.productId)}
      />
      <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-10 text-center">
        {t("title")}
      </h1>
      <CheckoutStepper cartItems={cartForClient} total={total} locale={locale} />
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { getHydratedCart, getCartTotal } from "@/lib/cart";
import CartSummary from "@/components/cart/CartSummary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon panier" };

interface CartPageProps {
  params: { locale: string };
}

export default async function CartPage({ params: { locale } }: CartPageProps) {
  setRequestLocale(locale);
  const items = await getHydratedCart(locale);
  const total = getCartTotal(items);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-20 h-20 bg-[#F4F4F1] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-[#E8E8E3]" />
        </div>
        <h1 className="text-2xl font-semibold text-[#111210] mb-3">Votre panier est vide</h1>
        <p className="text-[#6B7280] mb-8">
          Découvrez nos produits et ajoutez-les à votre panier.
        </p>
        <Link href={`/${locale}/shop`} className="btn-primary inline-flex">
          Explorer la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-8">
        Mon panier{" "}
        <span className="text-[#9CA3AF] font-normal text-xl">
          ({items.reduce((a, i) => a + i.quantity, 0)} article{items.length !== 1 ? "s" : ""})
        </span>
      </h1>
      <CartSummary items={items} locale={locale} total={total} />
    </div>
  );
}

import Link from "next/link";
import { ShoppingBag, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCartFromCookie } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import CartDrawer from "./CartDrawer";
import LocaleSwitcher from "./LocaleSwitcher";
import PromoBanner from "./PromoBanner";
import Image from "next/image";
import logo from "@/public/images/logo.png"

interface HeaderProps {
  locale: string;
}

export default async function Header({ locale }: HeaderProps) {
  const t = await getTranslations("nav");
  const pt = await getTranslations("promo");
  const cartItems = await getCartFromCookie();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch up to 3 featured products for nav links
  let featuredProducts: { slug: string; name: Record<string, string> }[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: { featured: true, active: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, name: true },
    }) as { slug: string; name: Record<string, string> }[];
  } catch {
    // DB not available at build time — skip
  }

  return (
    <>
      <PromoBanner message={pt("text")} />
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <img
                src={logo.src}
                alt="Vitalis Home and Wellness - Électronique et Domotique"
               
                className="size-5 object-cover"
                priority
              />
              <span className="font-semibold text-sm tracking-tight text-[#111210]">
                Vitalis<span className="text-emerald-500">HomeandWellness</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/${locale}/shop`}
                className="text-sm font-medium text-[#6B7280] hover:text-[#111210] transition-colors"
              >
                {t("shop")}
              </Link>

              {featuredProducts.map((p) => {
                const name = (p.name as Record<string, string>)[locale] ?? (p.name as Record<string, string>).fr ?? "";
                return (
                  <Link
                    key={p.slug}
                    href={`/${locale}/shop/${p.slug}`}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LocaleSwitcher locale={locale} />
              <CartDrawer cartCount={cartCount} locale={locale} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

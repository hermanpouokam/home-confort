import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import AnimatedSection from "./AnimatedSection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


interface FeaturedProductsProps { locale: string }

export default async function FeaturedProducts({ locale }: FeaturedProductsProps) {
  const t = await getTranslations("featured");

  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <AnimatedSection className="flex items-end justify-between mb-10">
        <div>
          <span className="section-label block mb-2">{t("title")}</span>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111210]">{t("subtitle")}</h2>
        </div>
        <Link href={`/${locale}/shop`} className="hidden sm:flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: (typeof products)[0], i: number) => (
          <AnimatedSection key={product.id} delay={i * 0.05}>
            <ProductCard product={product} locale={locale} />
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}

"use client";

import ProductCard from "./ProductCard";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface Product {
  id: string;
  slug: string;
  name: Record<string, string> | unknown;
  price: unknown;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
}

interface ProductGridProps {
  products: Product[];
  locale: string;
}

export default function ProductGrid({ products, locale }: ProductGridProps) {
  const t = useTranslations("shop");

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <Package className="w-12 h-12 mx-auto mb-4 text-[#E8E8E3]" />
        <h3 className="font-semibold text-[#111210] mb-2">{t("noProducts")}</h3>
        <p className="text-sm text-[#6B7280]">{t("tryModifyFilters")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";
import SearchBar from "@/components/shop/SearchBar";
import FilterPanel from "@/components/shop/FilterPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Boutique" };

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; cursor?: string }>;
}

const PAGE_SIZE = 12;

export default async function ShopPage({ params, searchParams: searchParamsPromise }: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const { q, category, sort = "newest", cursor } = await searchParamsPromise;

  const orderBy =
    sort === "priceAsc" ? { price: "asc" as const }
    : sort === "priceDesc" ? { price: "desc" as const }
    : sort === "featured" ? { featured: "desc" as const }
    : { createdAt: "desc" as const };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { OR: [
          { name: { path: ["fr"], string_contains: q.toLowerCase() } },
          { name: { path: ["en"], string_contains: q.toLowerCase() } },
        ]} : {}),
      },
      orderBy,
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { category: true },
    }),
    prisma.product.count({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { OR: [
          { name: { path: ["fr"], string_contains: q.toLowerCase() } },
          { name: { path: ["en"], string_contains: q.toLowerCase() } },
        ]} : {}),
      },
    }),
    prisma.category.findMany(),
  ]);

  const hasMore = products.length > PAGE_SIZE;
  const displayProducts = hasMore ? products.slice(0, PAGE_SIZE) : products;
  const nextCursor = hasMore ? displayProducts[displayProducts.length - 1].id : null;

  const categoriesWithNames = categories.map((c: (typeof categories)[0]) => ({
    ...c,
    name: c.name as Record<string, string>,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-2">{t("title")}</h1>
        <p className="text-sm text-[#6B7280]">{total} {t("results", { count: total })}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Suspense><SearchBar placeholder={t("search")} defaultValue={q} /></Suspense>
        </div>
        <Suspense>
          <FilterPanel categories={categoriesWithNames} locale={locale} currentCategory={category} currentSort={sort} />
        </Suspense>
      </div>

      <ProductGrid products={displayProducts} locale={locale} />

      {hasMore && nextCursor && (
        <div className="mt-10 text-center">
          <a href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), sort, cursor: nextCursor }).toString()}`} className="btn-ghost inline-flex">
            {t("loadMore")}
          </a>
        </div>
      )}
    </div>
  );
}

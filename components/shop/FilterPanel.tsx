"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  slug: string;
  name: Record<string, string>;
}

interface FilterPanelProps {
  categories: Category[];
  locale: string;
  currentCategory?: string;
  currentSort?: string;
}

export default function FilterPanel({
  categories,
  locale,
  currentCategory,
  currentSort,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("shop");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("cursor");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-70" : ""}`}>
      {/* Category filter */}
      <Select
        value={currentCategory ?? "all"}
        onValueChange={(val) => updateParam("category", val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t("category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name[locale] ?? cat.name.fr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={currentSort ?? "newest"}
        onValueChange={(val) => updateParam("sort", val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t("sort")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("sortOptions.newest")}</SelectItem>
          <SelectItem value="priceAsc">{t("sortOptions.priceAsc")}</SelectItem>
          <SelectItem value="priceDesc">{t("sortOptions.priceDesc")}</SelectItem>
          <SelectItem value="featured">{t("sortOptions.featured")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

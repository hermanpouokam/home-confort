"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes catégories</SelectItem>
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
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Plus récents</SelectItem>
          <SelectItem value="priceAsc">Prix croissant</SelectItem>
          <SelectItem value="priceDesc">Prix décroissant</SelectItem>
          <SelectItem value="featured">Bestsellers</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

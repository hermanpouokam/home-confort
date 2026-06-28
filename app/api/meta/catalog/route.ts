// app/api/meta/catalog/route.ts
// Expose les produits actifs au format Meta Product Catalog (JSON Feed)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Empêche Next.js de tenter un pré-rendu statique au build
export const dynamic = "force-dynamic";
import type { MetaCatalogProduct } from "@/lib/meta/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homeconfort.cm";
const DEFAULT_LOCALE = "fr";

function getLocalizedField(field: unknown, locale: string): string {
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null) {
    const obj = field as Record<string, string>;
    return obj[locale] ?? obj["fr"] ?? obj["en"] ?? Object.values(obj)[0] ?? "";
  }
  return "";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const catalog: MetaCatalogProduct[] = products.map((p) => {
      const name = getLocalizedField(p.name, DEFAULT_LOCALE);
      const description = getLocalizedField(p.description, DEFAULT_LOCALE);
      const price = Number(p.price);
      const imageUrl =
        p.images[0]
          ? p.images[0].startsWith("http")
            ? p.images[0]
            : `${SITE_URL}${p.images[0]}`
          : `${SITE_URL}/placeholder.png`;

      return {
        id: p.id,
        title: name,
        description: description || name,
        availability: p.stock > 0 ? "in stock" : "out of stock",
        condition: "new",
        price: `${price} XAF`,
        link: `${SITE_URL}/${DEFAULT_LOCALE}/shop/${p.slug}`,
        image_link: imageUrl,
        brand: "HomeConfort",
      };
    });

    // Headers pour permettre à Meta de récupérer ce flux
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[/api/meta/catalog] Erreur:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

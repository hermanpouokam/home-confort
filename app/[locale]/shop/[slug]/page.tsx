import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ChevronRight, Star, Clock, Check, Truck, Lock, CheckCircle, Headphones } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatPrice, getLocalizedField, isPromoActive, getPromoPercent } from "@/lib/utils";
import ImageGallery from "@/components/shop/ImageGallery";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductCard from "@/components/shop/ProductCard";
import { Badge } from "@/components/ui/badge";
import ViewContentTracker from "@/components/meta/ViewContentTracker";
import { sendCapiEvent, buildHashedUserData } from "@/lib/meta/server";
import { generateEventId } from "@/lib/meta/pixel";

interface ProductPageProps {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale, slug } }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: getLocalizedField(product.name, locale) };
}

export default async function ProductPage({ params: { locale, slug } }: ProductPageProps) {
  setRequestLocale(locale);
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { category: true },
  });



  if (!product) notFound();

  const name = getLocalizedField(product.name, locale);
  const description = getLocalizedField(product.description, locale);
  const categoryName = getLocalizedField(product.category.name, locale);
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const promoActive = isPromoActive(originalPrice, product.promoEndsAt);
  const promoPercent = promoActive && originalPrice ? getPromoPercent(price, originalPrice) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const eventId = generateEventId();
  const hdrs = headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    undefined;
  const userAgent = hdrs.get("user-agent") ?? undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Fire-and-forget — ne bloque pas le rendu
  void sendCapiEvent({
    eventName: "ViewContent",
    eventId,
    eventSourceUrl: `${siteUrl}/${locale}/shop/${slug}`,
    userData: buildHashedUserData({ ip, userAgent }),
    customData: {
      content_ids: [product.id],
      content_name: name,
      content_type: "product",
      currency: "XAF",
      value: price,
    },
  });

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
    take: 4,
    orderBy: { featured: "desc" },
    include: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ViewContentTracker
        eventId={eventId}
        productId={product.id}
        productName={name}
        price={price}
      />
      <nav className="flex items-center gap-2 text-sm text-[#9CA3AF] mb-8">
        <Link href={`/${locale}`} className="hover:text-[#111210] transition-colors">Accueil</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${locale}/shop`} className="hover:text-[#111210] transition-colors">Boutique</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${locale}/shop?category=${product.category.slug}`} className="hover:text-[#111210] transition-colors">
          {categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111210] font-medium truncate max-w-[200px]">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <ImageGallery images={product.images} name={name} />

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{categoryName}</Badge>
              {product.featured && <Badge className="flex items-center gap-1"><Star className="w-3 h-3" /> Bestseller</Badge>}
              {promoActive && promoPercent > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{promoPercent}%</span>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-3">{name}</h1>
            <p className="text-[#6B7280] leading-relaxed">{description}</p>
          </div>

          <div className="bg-[#F4F4F1] rounded-2xl p-5">
            {promoActive && originalPrice ? (
              <div className="flex items-baseline gap-3 mb-1">
                <p className="text-3xl font-bold text-red-600">{formatPrice(price)}</p>
                <p className="text-lg text-[#9CA3AF] line-through">{formatPrice(originalPrice)}</p>
              </div>
            ) : (
              <p className="text-3xl font-semibold text-[#111210] mb-1">{formatPrice(price)}</p>
            )}
            {promoActive && product.promoEndsAt && (
              <p className="text-xs text-red-500 font-medium mb-2">
                <Clock className="w-3 h-3 inline mr-1" />Offre valable jusqu&apos;au {new Date(product.promoEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            <div>
              {isOutOfStock ? (
                <span className="text-sm text-red-500 font-medium">Rupture de stock</span>
              ) : isLowStock ? (
                <span className="text-sm text-amber-600 font-medium">
                  Plus que {product.stock} en stock — commandez vite !
                </span>
              ) : (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> En stock ({product.stock} disponibles)</span>
              )}
            </div>
          </div>

          <AddToCartButton
            productId={product.id}
            disabled={isOutOfStock}
            productName={product.name}
            productPrice={product.price}
            label={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            className="text-base py-3 h-auto"
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Truck, label: "Livraison 24h" },
              { icon: Lock, label: "Paiement sécurisé" },
              { icon: CheckCircle, label: "Qualité garantie" },
              { icon: Headphones, label: "Support 7j/7" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111210] mb-6">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.map((p: typeof similar[0]) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
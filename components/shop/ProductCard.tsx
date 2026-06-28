import { Star } from "lucide-react";
import SmartImage, { isVideoUrl } from "@/components/ui/smart-image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getLocalizedField, isPromoActive, getPromoPercent } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: Record<string, string> | unknown;
    price: unknown;
    stock: number;
    images: string[];
    featured: boolean;
    active: boolean;
    originalPrice?: unknown;
    promoEndsAt?: Date | string | null;
  };
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const name = getLocalizedField(product.name, locale);
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const promoActive = isPromoActive(originalPrice, product.promoEndsAt);
  const promoPercent = promoActive && originalPrice ? getPromoPercent(price, originalPrice) : 0;

  const image = product.images.find((url) => !isVideoUrl(url)) ?? `https://picsum.photos/seed/${product.slug}/400/300`;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="card-product group flex flex-col overflow-hidden">
      <Link href={`/${locale}/shop/${product.slug}`} className="relative block overflow-hidden bg-[#F4F4F1]">
        <div className="aspect-[4/3] relative overflow-hidden">
          <SmartImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Badges superposés */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {promoActive && promoPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{promoPercent}%
            </span>
          )}
          {product.featured && !promoActive && (
            <Badge className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Bestseller</Badge>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Badge variant="secondary">Rupture de stock</Badge>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <Link href={`/${locale}/shop/${product.slug}`}>
            <h3 className="font-medium text-[#111210] text-sm leading-snug hover:text-emerald-600 transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            {promoActive && originalPrice ? (
              <div className="flex items-baseline gap-1.5">
                <p className="font-bold text-red-600">{formatPrice(price)}</p>
                <p className="text-xs text-[#9CA3AF] line-through">{formatPrice(originalPrice)}</p>
              </div>
            ) : (
              <p className="font-semibold text-[#111210]">{formatPrice(price)}</p>
            )}
            {isLowStock && (
              <p className="text-xs text-amber-600 font-medium">Plus que {product.stock} en stock</p>
            )}
            {!isLowStock && !isOutOfStock && (
              <p className="text-xs text-emerald-600">En stock</p>
            )}
          </div>
          <AddToCartButton productId={product.id} disabled={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
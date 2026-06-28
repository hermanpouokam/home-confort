import SmartImage, { isVideoUrl } from "@/components/ui/smart-image";
import Link from "next/link";
import { formatPrice, getLocalizedField, isPromoActive } from "@/lib/utils";
import type { CartItemWithProduct } from "@/lib/cart";
import CartActions from "./CartActions";

interface CartSummaryProps {
  items: CartItemWithProduct[];
  locale: string;
  total: number;
}

export default function CartSummary({ items, locale, total }: CartSummaryProps) {
  const shippingFree = total >= 50000;
  const shippingCost = shippingFree ? 0 : 1500;

  return (
    <div className="flex flex-col gap-6">
      {/* Items */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const name = getLocalizedField(item.product.name, locale);
          const image = item.product.images.find((u) => !isVideoUrl(u)) ?? `https://picsum.photos/seed/${item.productId}/200/200`;
          const promoActive = isPromoActive(item.product.originalPrice, item.product.promoEndsAt);

          return (
            <div key={item.productId} className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E8E8E3]">
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#F4F4F1]">
                <SmartImage
                  src={image}
                  alt={name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/shop/${item.productId}`}
                  className="font-medium text-sm text-[#111210] hover:text-emerald-600 transition-colors line-clamp-2"
                >
                  {name}
                </Link>
                {promoActive && item.product.originalPrice ? (
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="font-bold text-red-600 text-sm">{formatPrice(item.product.price)}</p>
                    <p className="text-xs text-[#9CA3AF] line-through">{formatPrice(item.product.originalPrice)}</p>
                  </div>
                ) : (
                  <p className="font-semibold text-[#111210] mt-1">{formatPrice(item.product.price)}</p>
                )}
              </div>
              <CartActions
                productId={item.productId}
                quantity={item.quantity}
                stock={item.product.stock}
              />
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
        <h2 className="font-semibold text-[#111210] mb-4">Récapitulatif</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Sous-total</span>
            <span className="font-medium">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Livraison</span>
            <span className={shippingFree ? "text-emerald-600 font-medium" : "font-medium"}>
              {shippingFree ? "Gratuite" : formatPrice(shippingCost)}
            </span>
          </div>
          {!shippingFree && (
            <p className="text-xs text-[#9CA3AF]">
              Plus que {formatPrice(50000 - total)} pour la livraison gratuite
            </p>
          )}
          <div className="border-t border-[#E8E8E3] pt-3 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatPrice(total + shippingCost)}</span>
          </div>
        </div>

        <Link
          href={`/${locale}/checkout`}
          className="btn-primary justify-center mt-6 w-full text-base py-3"
        >
          Passer la commande
        </Link>
        <Link
          href={`/${locale}/shop`}
          className="btn-ghost justify-center mt-3 w-full"
        >
          Continuer les achats
        </Link>
      </div>
    </div>
  );
}

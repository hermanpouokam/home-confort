"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/meta/pixel";

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
  productPrice?: number;
  disabled?: boolean;
  qty?: number;
  className?: string;
  label?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  disabled = false,
  qty = 1,
  className,
  label,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (disabled || isPending) return;
    startTransition(async () => {
      await addToCart(productId, qty);

      // ── Meta AddToCart ──────────────────────────────────────────────────
      trackEvent("AddToCart", {
        content_ids: [productId],
        content_name: productName,
        content_type: "product",
        currency: "XAF",
        value: productPrice ? productPrice * qty : undefined,
        contents: [{ id: productId, quantity: qty, item_price: productPrice }],
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  if (label) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "btn-primary justify-center w-full",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : added ? (
          <>
            <Check className="w-4 h-4" />
            Ajouté !
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
        disabled
          ? "bg-[#F4F4F1] text-[#9CA3AF] cursor-not-allowed"
          : added
            ? "bg-emerald-400 text-white"
            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-400 hover:text-white active:scale-95",
        className
      )}
      aria-label="Ajouter au panier"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
    </button>
  );
}

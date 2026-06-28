"use client";

import { useTransition } from "react";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { updateCartItem, removeFromCart } from "@/actions/cart";
import { trackEvent } from "@/lib/meta/pixel";

interface CartActionsProps {
  productId: string;
  quantity: number;
  stock: number;
}

export default function CartActions({ productId, quantity, stock }: CartActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newQty: number) => {
    startTransition(async () => {
      await updateCartItem(productId, newQty);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(productId);
      // ── Meta RemoveFromCart ─────────────────────────────────────────────
      trackEvent("RemoveFromCart", {
        content_ids: [productId],
        content_name: productName,
        content_type: "product",
        currency: "XAF",
        value: productPrice ? productPrice * quantity : undefined,
        contents: [{ id: productId, quantity, item_price: productPrice }],
      });
    });
  };

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {/* Qty stepper */}
      <div className="flex items-center gap-1 bg-[#F4F4F1] rounded-xl p-1">
        <button
          onClick={() => handleUpdate(quantity - 1)}
          disabled={isPending || quantity <= 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : quantity}
        </span>
        <button
          onClick={() => handleUpdate(quantity + 1)}
          disabled={isPending || quantity >= stock}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
        Supprimer
      </button>
    </div>
  );
}

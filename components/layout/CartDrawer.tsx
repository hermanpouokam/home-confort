"use client";

import { useState } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CartDrawerProps {
  cartCount: number;
  locale: string;
}

export default function CartDrawer({ cartCount, locale }: CartDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-xl hover:bg-[#F4F4F1] transition-colors"
        aria-label="Panier"
      >
        <ShoppingBag className="w-5 h-5 text-[#6B7280]" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#E8E8E3]">
            <h2 className="font-semibold text-lg">Mon panier</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-xl hover:bg-[#F4F4F1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 text-center text-[#6B7280]">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#E8E8E3]" />
            <p className="font-medium text-[#111210] mb-1">
              {cartCount > 0
                ? `${cartCount} article${cartCount > 1 ? "s" : ""} dans votre panier`
                : "Votre panier est vide"}
            </p>
            {cartCount === 0 && (
              <p className="text-sm">Découvrez nos produits et ajoutez-les à votre panier.</p>
            )}
          </div>

          <div className="p-5 border-t border-[#E8E8E3] flex flex-col gap-3">
            <Link
              href={`/${locale}/cart`}
              onClick={() => setOpen(false)}
              className="btn-primary justify-center"
            >
              Voir le panier
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="btn-ghost justify-center"
            >
              Continuer les achats
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, ToggleLeft, ToggleRight, Link2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "@/components/admin/ProductForm";
import { toggleProductActive } from "@/actions/admin";

interface Category {
  id: string;
  slug: string;
  name: Record<string, string>;
}

interface Product {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: unknown;
  stock: number;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: string[];
}

interface AdminProductActionsProps {
  categories: Category[];
  mode: "create" | "edit";
  product?: Product;
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const url = `${siteUrl}/fr/shop/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors text-[#6B7280]"
      title="Copier le lien du produit"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Link2 className="w-4 h-4" />
      )}
    </button>
  );
}

export default function AdminProductActions({ categories, mode, product }: AdminProductActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!product) return;
    startTransition(async () => {
      await toggleProductActive(product.id, !product.active);
    });
  };

  if (mode === "create") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un produit</DialogTitle>
          </DialogHeader>
          <ProductForm categories={categories} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {product && (
        <>
          <CopyLinkButton slug={product.slug} />
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors text-[#6B7280]"
            title={product.active ? "Désactiver" : "Activer"}
          >
            {product.active
              ? <ToggleRight className="w-4 h-4 text-emerald-500" />
              : <ToggleLeft className="w-4 h-4" />
            }
          </button>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors text-[#6B7280]">
            <Edit2 className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <ProductForm categories={categories} product={product} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Upload, X, Play, ImageIcon, Tag, Star } from "lucide-react";

interface Category { id: string; slug: string; name: Record<string, string> }
interface Product {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: unknown;
  stock: number;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: string[];
  originalPrice?: unknown;
  promoEndsAt?: Date | string | null;
}
interface ProductFormProps { categories: Category[]; product?: Product; onSuccess?: () => void }
type FormState = { errors?: Partial<Record<string, string[]>>; success?: boolean; message?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary flex items-center gap-2">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function toDateInputValue(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

export default function ProductForm({ categories, product, onSuccess }: ProductFormProps) {
  const router = useRouter();

  // Champs principaux contrôlés
  const [nameFr, setNameFr] = useState(product?.name?.fr ?? "");
  const [nameEn, setNameEn] = useState(product?.name?.en ?? "");
  const [descriptionFr, setDescriptionFr] = useState(product?.description?.fr ?? "");
  const [descriptionEn, setDescriptionEn] = useState(product?.description?.en ?? "");
  const [price, setPrice] = useState(product ? String(Number(product.price)) : "");
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);

  // Champs promo
  const hasExistingPromo = !!(product?.originalPrice);
  const [hasPromo, setHasPromo] = useState(hasExistingPromo);
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice ? String(Number(product.originalPrice)) : ""
  );
  const [promoEndsAt, setPromoEndsAt] = useState(toDateInputValue(product?.promoEndsAt));

  const [mediaList, setMediaList] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const boundAction = product
    ? (updateProduct.bind(null, product.id) as (state: FormState, formData: FormData) => Promise<FormState>)
    : (createProduct as (state: FormState, formData: FormData) => Promise<FormState>);

  const [state, formAction] = useFormState(boundAction, {} as FormState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      if (onSuccess) onSuccess();
    }
  }, [state?.success, onSuccess, router]);

  // Calcul automatique du % de réduction
  const promoPercent = hasPromo && originalPrice && price
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
        else setUploadError(data.error ?? "Erreur d'upload");
      } catch {
        setUploadError("Erreur réseau lors de l'upload");
      }
    }
    setMediaList((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (idx: number) => setMediaList((prev) => prev.filter((_, i) => i !== idx));
  const moveFirst = (idx: number) => {
    if (idx === 0) return;
    setMediaList((prev) => { const n = [...prev]; const [item] = n.splice(idx, 1); n.unshift(item); return n; });
  };

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="nameFr" value={nameFr} />
      <input type="hidden" name="nameEn" value={nameEn} />
      <input type="hidden" name="descriptionFr" value={descriptionFr} />
      <input type="hidden" name="descriptionEn" value={descriptionEn} />
      <input type="hidden" name="price" value={price} />
      <input type="hidden" name="stock" value={stock} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="featured" value={featured ? "on" : ""} />
      <input type="hidden" name="active" value={active ? "on" : ""} />
      <input type="hidden" name="images" value={mediaList.join(",")} />
      <input type="hidden" name="hasPromo" value={hasPromo ? "on" : ""} />
      <input type="hidden" name="originalPrice" value={hasPromo ? originalPrice : ""} />
      <input type="hidden" name="promoEndsAt" value={hasPromo ? promoEndsAt : ""} />

      {/* Noms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nom (FR) *</Label>
          <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="Ampoule LED connectée" />
          {state?.errors?.nameFr && <p className="text-xs text-red-500">{state.errors.nameFr[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Nom (EN) *</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Smart LED Bulb" />
          {state?.errors?.nameEn && <p className="text-xs text-red-500">{state.errors.nameEn[0]}</p>}
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Description (FR) *</Label>
          <Textarea value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} placeholder="Description en français..." rows={3} />
          {state?.errors?.descriptionFr && <p className="text-xs text-red-500">{state.errors.descriptionFr[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Description (EN) *</Label>
          <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="English description..." rows={3} />
          {state?.errors?.descriptionEn && <p className="text-xs text-red-500">{state.errors.descriptionEn[0]}</p>}
        </div>
      </div>

      {/* Prix, stock, catégorie */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>{hasPromo ? "Prix promo (FCFA) *" : "Prix (FCFA) *"}</Label>
          <Input type="number" step="100" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="14990" />
          {state?.errors?.price && <p className="text-xs text-red-500">{state.errors.price[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Stock *</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          {state?.errors?.stock && <p className="text-xs text-red-500">{state.errors.stock[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Catégorie *</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name.fr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.categoryId && <p className="text-xs text-red-500">{state.errors.categoryId[0]}</p>}
        </div>
      </div>

      {/* Section Promotion */}
      <div className={`rounded-2xl border-2 transition-colors ${hasPromo ? "border-red-200 bg-red-50/40" : "border-[#E8E8E3] bg-[#FAFAF8]"} p-4 space-y-4`}>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasPromo}
            onChange={(e) => {
              setHasPromo(e.target.checked);
              if (!e.target.checked) { setOriginalPrice(""); setPromoEndsAt(""); }
            }}
            className="w-4 h-4 rounded accent-red-500"
          />
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-[#111210]">Mettre en promotion</span>
          </div>
          {hasPromo && promoPercent > 0 && (
            <span className="ml-auto text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
              -{promoPercent}%
            </span>
          )}
        </label>

        {hasPromo && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-red-700">Prix d&apos;origine (FCFA) *</Label>
              <Input
                type="number"
                step="100"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex: 19990"
                className="border-red-200 focus-visible:border-red-400 focus-visible:ring-red-400/20"
              />
              <p className="text-xs text-[#9CA3AF]">Prix barré affiché en vitrine</p>
              {state?.errors?.originalPrice && <p className="text-xs text-red-500">{state.errors.originalPrice[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-700">Fin de promo (optionnel)</Label>
              <Input
                type="datetime-local"
                value={promoEndsAt}
                onChange={(e) => setPromoEndsAt(e.target.value)}
                className="border-red-200 focus-visible:border-red-400 focus-visible:ring-red-400/20"
              />
              <p className="text-xs text-[#9CA3AF]">Laisser vide = promo sans limite</p>
            </div>
          </div>
        )}
      </div>

      {/* Media upload */}
      <div className="space-y-2">
        <Label>Photos & Vidéos</Label>
        <label className={`flex items-center gap-2 w-fit px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm ${uploading ? "opacity-50 pointer-events-none" : "border-[#E8E8E3] text-[#6B7280] hover:border-emerald-400 hover:text-emerald-600"}`}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Upload en cours..." : "Ajouter des fichiers"}
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
        <p className="text-xs text-[#9CA3AF]">JPG, PNG, WebP, MP4, WebM — 10 Mo max</p>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        {mediaList.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {mediaList.map((url, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden bg-[#F4F4F1] aspect-square border border-[#E8E8E3]">
                {isVideo(url) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                    <Play className="w-6 h-6 text-[#6B7280]" />
                    <span className="text-[9px] text-[#9CA3AF] text-center break-all line-clamp-2">{url.split("/").pop()}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-full object-cover" />
                )}
                {idx === 0 && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">Principal</span>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {idx > 0 && (
                    <button type="button" onClick={() => moveFirst(idx)} className="bg-white rounded-lg px-2 py-1 text-[10px] font-medium hover:bg-emerald-50">Principal</button>
                  )}
                  <button type="button" onClick={() => removeMedia(idx)} className="bg-white rounded-lg p-1 hover:bg-red-50"><X className="w-3 h-3 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] py-3 border border-dashed border-[#E8E8E3] rounded-xl px-4">
            <ImageIcon className="w-4 h-4" />
            Aucun fichier — une image générique sera utilisée
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          <span className="flex items-center gap-1 text-sm font-medium"><Star className="w-3.5 h-3.5 text-amber-400" /> Bestseller</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          <span className="text-sm font-medium">Actif</span>
        </label>
      </div>

      {state?.message && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.message}</p>
      )}

      <div className="flex justify-end pt-2 border-t border-[#E8E8E3]">
        <SubmitButton />
      </div>
    </form>
  );
}
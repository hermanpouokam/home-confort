import { Star } from "lucide-react";
import { Metadata } from "next";
import SmartImage, { isVideoUrl } from "@/components/ui/smart-image";
import { prisma } from "@/lib/prisma";
import { formatPrice, getLocalizedField } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AdminProductActions from "./AdminProductActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany(),
  ]);

  const categoriesForForm = categories.map((c: (typeof categories)[0]) => ({
    id: c.id,
    slug: c.slug,
    name: c.name as Record<string, string>,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111210]">Produits</h1>
          <p className="text-sm text-[#6B7280] mt-1">{products.length} produit(s) au total</p>
        </div>
        <AdminProductActions categories={categoriesForForm} mode="create" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E3] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#E8E8E3]">
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Produit</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider hidden md:table-cell">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Prix</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider hidden sm:table-cell">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E3]">
            {products.map((product: (typeof products)[0]) => {
              const name = getLocalizedField(product.name, "fr");
              const image = product.images.find((url) => !isVideoUrl(url)) ?? `https://picsum.photos/seed/${product.slug}/80/80`;
              const categoryName = getLocalizedField(product.category.name, "fr");
              return (
                <tr key={product.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#F4F4F1] shrink-0">
                        <SmartImage src={image} alt={name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111210] line-clamp-1">{name}</p>
                        <p className="text-xs text-[#9CA3AF]">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">{categoryName}</td>
                  <td className="px-4 py-3 font-medium text-[#111210]">{formatPrice(Number(product.price))}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock === 0 ? "text-red-500 font-medium" : product.stock <= 5 ? "text-amber-600 font-medium" : "text-[#6B7280]"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Actif" : "Inactif"}</Badge>
                      {product.featured && <Badge className="flex items-center gap-1">⭐</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminProductActions
                      categories={categoriesForForm}
                      mode="edit"
                      product={{
                        id: product.id,
                        slug: product.slug,
                        name: product.name as Record<string, string>,
                        description: product.description as Record<string, string>,
                        price: product.price,
                        stock: product.stock,
                        categoryId: product.categoryId,
                        featured: product.featured,
                        active: product.active,
                        images: product.images,
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
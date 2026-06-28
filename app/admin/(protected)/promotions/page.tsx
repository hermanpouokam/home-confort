import { Tag, AlertTriangle } from "lucide-react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice, getLocalizedField, getPromoPercent } from "@/lib/utils";
import SmartImage, { isVideoUrl } from "@/components/ui/smart-image";
import RemovePromoButton from "./RemovePromoButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Promotions" };

export default async function PromotionsPage() {
    const now = new Date();

    const promoProducts = await prisma.product.findMany({
        where: { originalPrice: { not: null } },
        orderBy: { updatedAt: "desc" },
    });

    const active = promoProducts.filter(
        (p) => !p.promoEndsAt || new Date(p.promoEndsAt) > now
    );
    const expired = promoProducts.filter(
        (p) => p.promoEndsAt && new Date(p.promoEndsAt) <= now
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[#111210]">Promotions</h1>
                <p className="text-sm text-[#6B7280] mt-1">
                    {active.length} promo{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""}
                    {expired.length > 0 && ` · ${expired.length} expirée${expired.length !== 1 ? "s" : ""}`}
                </p>
            </div>

            {promoProducts.length === 0 ? (
                <div className="text-center py-20 text-[#9CA3AF]">
                    <div className="flex justify-center mb-4"><Tag className="w-12 h-12 text-emerald-400" /></div>
                    <p className="font-medium text-[#6B7280]">Aucune promotion en cours</p>
                    <p className="text-sm mt-1">Activez une promo depuis la page Produits en éditant un produit.</p>
                </div>
            ) : (
                <>
                    {/* Promotions actives */}
                    {active.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Actives</h2>
                            <div className="space-y-3">
                                {active.map((p) => {
                                    const name = getLocalizedField(p.name, "fr");
                                    const price = Number(p.price);
                                    const origPrice = Number(p.originalPrice);
                                    const percent = getPromoPercent(price, origPrice);
                                    const image = p.images.find((u) => !isVideoUrl(u)) ?? `https://picsum.photos/seed/${p.slug}/80/80`;
                                    const isExpiringSoon = p.promoEndsAt && (new Date(p.promoEndsAt).getTime() - now.getTime()) < 1000 * 60 * 60 * 48;

                                    return (
                                        <div key={p.id} className="flex items-center gap-4 bg-white rounded-2xl border border-[#E8E8E3] px-4 py-3 hover:border-emerald-200 transition-colors">
                                            {/* Thumbnail */}
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F4F4F1] shrink-0">
                                                <SmartImage src={image} alt={name} fill sizes="48px" className="object-cover" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[#111210] text-sm truncate">{name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-red-600 font-bold text-sm">{formatPrice(price)}</span>
                                                    <span className="text-xs text-[#9CA3AF] line-through">{formatPrice(origPrice)}</span>
                                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">-{percent}%</span>
                                                </div>
                                            </div>

                                            {/* Date fin */}
                                            <div className="text-right shrink-0">
                                                {p.promoEndsAt ? (
                                                    <div>
                                                        <p className={`text-xs font-medium ${isExpiringSoon ? "text-amber-600" : "text-[#6B7280]"}`}>
                                                            {isExpiringSoon ? <><AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Expire le</> : "Expire le"}
                                                        </p>
                                                        <p className={`text-xs ${isExpiringSoon ? "text-amber-600 font-semibold" : "text-[#9CA3AF]"}`}>
                                                            {new Date(p.promoEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-emerald-600 font-medium">Sans limite</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <RemovePromoButton productId={p.id} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Promotions expirées */}
                    {expired.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Expirées</h2>
                            <div className="space-y-3 opacity-60">
                                {expired.map((p) => {
                                    const name = getLocalizedField(p.name, "fr");
                                    const price = Number(p.price);
                                    const origPrice = Number(p.originalPrice);
                                    const percent = getPromoPercent(price, origPrice);
                                    const image = p.images.find((u) => !isVideoUrl(u)) ?? `https://picsum.photos/seed/${p.slug}/80/80`;

                                    return (
                                        <div key={p.id} className="flex items-center gap-4 bg-white rounded-2xl border border-[#E8E8E3] px-4 py-3">
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F4F4F1] shrink-0">
                                                <SmartImage src={image} alt={name} fill sizes="48px" className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[#111210] text-sm truncate">{name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-sm text-[#6B7280]">{formatPrice(price)}</span>
                                                    <span className="text-xs text-[#9CA3AF] line-through">{formatPrice(origPrice)}</span>
                                                    <span className="bg-gray-100 text-[#9CA3AF] text-xs font-bold px-1.5 py-0.5 rounded-full">-{percent}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-red-400 font-medium">Expirée le</p>
                                                <p className="text-xs text-[#9CA3AF]">
                                                    {p.promoEndsAt && new Date(p.promoEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <RemovePromoButton productId={p.id} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
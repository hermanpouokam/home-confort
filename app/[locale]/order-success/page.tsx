import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commande confirmée !" };

interface OrderSuccessPageProps {
  params: { locale: string };
  searchParams: { ref?: string };
}

export default function OrderSuccessPage({ params: { locale }, searchParams }: OrderSuccessPageProps) {
  setRequestLocale(locale);
  const orderRef = searchParams.ref ?? "HC-XXXXX";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-3">
        Commande confirmée !
      </h1>
      <p className="text-[#6B7280] mb-8 leading-relaxed">
        Merci pour votre commande. Notre équipe vous contactera par téléphone pour confirmer
        les détails de la livraison.
      </p>

      {/* Order number */}
      <div className="bg-[#F4F4F1] rounded-2xl p-6 mb-8 border border-[#E8E8E3]">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Package className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-medium text-[#6B7280] uppercase tracking-wider">Numéro de commande</p>
        </div>
        <p className="text-2xl font-semibold text-[#111210]">{orderRef}</p>
        <p className="text-xs text-[#9CA3AF] mt-2">
          Conservez ce numéro pour suivre votre commande
        </p>
      </div>

      {/* Next steps */}
      <div className="bg-emerald-50 rounded-2xl p-5 mb-8 text-left border border-emerald-100">
        <h3 className="font-semibold text-[#111210] mb-3">Prochaines étapes</h3>
        <ol className="space-y-2">
          {[
            "Notre équipe confirme votre commande",
            "Vous recevez un SMS de confirmation",
            "Livraison dans le créneau choisi",
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-[#6B7280]">
              <span className="w-5 h-5 bg-emerald-400 text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/${locale}`} className="btn-ghost flex-1 justify-center">
          Retour à l'accueil
        </Link>
        <Link href={`/${locale}/shop`} className="btn-primary flex-1 justify-center">
          Continuer mes achats
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

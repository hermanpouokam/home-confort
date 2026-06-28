import { getTranslations } from "next-intl/server";
import { Truck, ShieldCheck, Headphones } from "lucide-react";

export default async function TrustBar() {
  const t = await getTranslations("trust");

  const items = [
    { icon: Truck, label: t("delivery"), desc: "Douala en 24h" },
    { icon: ShieldCheck, label: t("quality"), desc: "Produits sélectionnés" },
    { icon: Headphones, label: t("support"), desc: "7j/7 de 8h à 20h" },
  ];

  return (
    <section className="bg-[#F4F4F1] border-y border-[#E8E8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E3]">
          {items.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 py-4 sm:py-0 sm:px-10 first:pl-0 last:pr-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-[#111210]">{label}</p>
                <p className="text-xs text-[#9CA3AF]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { MapPin, Truck, Headphones, CreditCard } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

export default async function ReassuranceSection() {
  const t = await getTranslations("reassurance");

  const blocks = [
    { icon: MapPin, title: t("address"), desc: t("addressDesc"), color: "bg-blue-100 text-blue-600" },
    { icon: Truck, title: t("delivery"), desc: t("deliveryDesc"), color: "bg-emerald-100 text-emerald-600" },
    { icon: Headphones, title: t("support"), desc: t("supportDesc"), color: "bg-purple-100 text-purple-600" },
    { icon: CreditCard, title: t("payment"), desc: t("paymentDesc"), color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <section className="bg-[#F4F4F1] py-16 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="section-label block mb-2">{t("sectionLabel")}</span>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111210]">
            {t("title")}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blocks.map(({ icon: Icon, title, desc, color }, i) => (
            <AnimatedSection key={title} delay={i * 0.05}>
              <div className="bg-white rounded-2xl p-6 border border-[#E8E8E3] text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#111210] mb-1">{title}</h3>
                <p className="text-sm text-[#6B7280]">{desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

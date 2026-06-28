import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import heroImg from "@/public/images/hero.jpg"
interface HeroProps {
  locale: string;
}

export default async function Hero({ locale }: HeroProps) {
  const t = await getTranslations("hero");

  return (
    <section className="bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Text — 3/5 */}
          <div className="lg:col-span-3">
            <AnimatedSection delay={0}>
              <span className="section-label mb-4 block">
                Électronique · Domotique · Alimentation
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111210] mb-6 whitespace-pre-line leading-[1.1]">
                {t("title")}
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-lg">
                {t("subtitle")}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/shop`} className="btn-primary text-base px-8 py-3">
                  {t("cta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={`/${locale}/shop?featured=true`} className="btn-ghost text-base px-8 py-3">
                  {t("ctaSecondary")}
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust micro */}
            <AnimatedSection delay={0.2}>
              <div className="flex flex-wrap items-center gap-6 mt-10">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  Livraison 24h
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  Qualité garantie
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  Support 7j/7
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Image — 2/5 */}
          <AnimatedSection className="lg:col-span-2" delay={0.1}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-3xl transform rotate-3 scale-95 opacity-50" />
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-[#E8E8E3]">
                <Image
                  src={heroImg.src}
                  alt="Vitalis Home and Wellness - Électronique et Domotique"
                  width={600}
                  height={700}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
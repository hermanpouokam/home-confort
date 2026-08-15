import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orderSuccess" });
  return { title: t("title") };
}

interface OrderSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orderSuccess");
  const orderRef = (await searchParams).ref ?? "HC-XXXXX";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-[#111210] mb-3">
        {t("title")}
      </h1>
      <p className="text-[#6B7280] mb-8 leading-relaxed">
        {t("message")}
      </p>

      {/* Order number */}
      <div className="bg-[#F4F4F1] rounded-2xl p-6 mb-8 border border-[#E8E8E3]">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Package className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-medium text-[#6B7280] uppercase tracking-wider">{t("orderNumber")}</p>
        </div>
        <p className="text-2xl font-semibold text-[#111210]">{orderRef}</p>
        <p className="text-xs text-[#9CA3AF] mt-2">
          {t("keepNumber")}
        </p>
      </div>

      {/* Next steps */}
      <div className="bg-emerald-50 rounded-2xl p-5 mb-8 text-left border border-emerald-100">
        <h3 className="font-semibold text-[#111210] mb-3">{t("nextStepsTitle")}</h3>
        <ol className="space-y-2">
          {[t("step1"), t("step2"), t("step3")].map((step, i) => (
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
          {t("backToHome")}
        </Link>
        <Link href={`/${locale}/shop`} className="btn-primary flex-1 justify-center">
          {t("continueShopping")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Zap, ShoppingBasket } from "lucide-react";
import AnimatedSection from "./AnimatedSection";


interface CategoryCardsProps { locale: string }

export default async function CategoryCards({ locale }: CategoryCardsProps) {
  const t = await getTranslations("categories");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  const iconMap: Record<string, React.ElementType> = {
    "electronique-domotique": Zap,
    alimentation: ShoppingBasket,
  };
  const colorMap: Record<string, string> = {
    "electronique-domotique": "from-emerald-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100",
    alimentation: "from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100",
  };
  const iconColorMap: Record<string, string> = {
    "electronique-domotique": "bg-emerald-100 text-emerald-600",
    alimentation: "bg-amber-100 text-amber-600",
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <AnimatedSection className="mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="section-label block mb-2">{t("title")}</span>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111210]">Trouvez ce qu'il vous faut</h2>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat: (typeof categories)[0], i: number) => {
          const Icon = iconMap[cat.slug] ?? Zap;
          const name = (cat.name as Record<string, string>)[locale] ?? (cat.name as Record<string, string>).fr;
          const gradient = colorMap[cat.slug] ?? "from-gray-50 to-gray-100";
          const iconColor = iconColorMap[cat.slug] ?? "bg-gray-100 text-gray-600";
          return (
            <AnimatedSection key={cat.id} delay={i * 0.05}>
              <Link
                href={`/${locale}/shop?category=${cat.slug}`}
                className={`group block bg-gradient-to-br ${gradient} border border-[#E8E8E3] hover:border-emerald-200 rounded-2xl p-8 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-[#9CA3AF]">{cat._count.products} {t("products")}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-[#111210] mb-2">{name}</h3>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 group-hover:gap-3 transition-all">
                  {t("discover")}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}

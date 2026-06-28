import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import CategoryCards from "@/components/landing/CategoryCards";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Marquee from "@/components/landing/Marquee";
import ReassuranceSection from "@/components/landing/ReassuranceSection";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vitalis Home and Wellness — Électronique, Domotique & Alimentation à Douala",
};

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  return (
    <>
      <Hero locale={locale} />
      <TrustBar />
      <CategoryCards locale={locale} />
      {/* <Marquee /> */}
      <FeaturedProducts locale={locale} />
      <ReassuranceSection />
    </>
  );
}

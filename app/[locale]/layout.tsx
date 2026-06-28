import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MetaPixel from "@/components/meta/MetaPixel";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vitalis Home and Wellness — Électronique, Domotique & Alimentation",
    template: "%s | Vitalis Home and Wellness",
  },
  description:
    "Votre partenaire de confiance pour l'électronique connectée et les produits alimentaires locaux de qualité à Douala, Cameroun.",
  openGraph: {
    siteName: "Vitalis Home and Wellness",
    locale: "fr_FR",
  },
};

const locales = ["fr", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={plusJakarta.variable}>
      <body className="bg-[#FAFAF8] text-[#111210] font-sans antialiased min-h-screen flex flex-col">
        <MetaPixel />
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import Link from "next/link";
import { Zap, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { getTranslations } from "next-intl/server";
import logo from "@/public/images/logo.png"
import Image from "next/image";

interface FooterProps {
  locale: string;
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations("footer");

  return (
    <footer className="bg-[#111210] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logo.src}
                alt="Vitalis Home and Wellness - Électronique et Domotique"
                className="size-6 object-cover"
                priority
              />
              <span className="font-semibold text-sm tracking-tight">
                Vitalis<span className="text-emerald-400">Home and Wellness</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t("description")}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-emerald-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-emerald-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-emerald-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              {t("shop")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/shop`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("allProducts")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=electronique-domotique`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("electronics")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=alimentation`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("food")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              {t("company")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <span>{t("address")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+237 677 517 721</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@vitalishomeandwellness.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Vitalis Home and Wellness. {t("copyright")}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Made in Cameroun</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

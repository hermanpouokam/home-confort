"use client";

import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

interface LocaleSwitcherProps {
  locale: string;
}

export default function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-[#F4F4F1] rounded-full p-1">
      <button
        onClick={() => switchLocale("fr")}
        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          locale === "fr"
            ? "bg-white text-[#111210] shadow-sm"
            : "text-[#6B7280] hover:text-[#111210]"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          locale === "en"
            ? "bg-white text-[#111210] shadow-sm"
            : "text-[#6B7280] hover:text-[#111210]"
        }`}
      >
        EN
      </button>
    </div>
  );
}

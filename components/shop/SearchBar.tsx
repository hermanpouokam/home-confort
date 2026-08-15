"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTransition, useState, useCallback, useRef } from "react";
import { trackEvent } from "@/lib/meta/pixel";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  placeholder: string;
  defaultValue?: string;
}

export default function SearchBar({ placeholder, defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const lastTrackedRef = useRef<string>("");
  const t = useTranslations("shop");

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }
      params.delete("cursor");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
      // ── Meta Search ───────────────────────────────────────────────────
      if (term.trim().length >= 2 && term !== lastTrackedRef.current) {
        lastTrackedRef.current = term;
        trackEvent("Search", { search_string: term.trim() });
      }
    },
    [pathname, router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    // Debounce
    const timeout = setTimeout(() => handleSearch(val), 400);
    return () => clearTimeout(timeout);
  };

  const handleClear = () => {
    setValue("");
    handleSearch("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`input-base pl-10 pr-10 ${isPending ? "opacity-70" : ""}`}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#F4F4F1] transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
      )}
    </div>
  );
}

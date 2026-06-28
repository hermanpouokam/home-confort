"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PromoBannerProps {
  message: string;
}

export default function PromoBanner({ message }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-emerald-400 text-white py-2 px-4 text-center text-sm font-medium relative">
      <span>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-500 rounded-lg transition-colors"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

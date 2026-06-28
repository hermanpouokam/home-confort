"use client";

import { CheckCircle, Truck, Zap, Leaf, Lock, Gift, Package, Star } from "lucide-react";

const chips = [
  { icon: CheckCircle, label: "Qualité garantie" },
  { icon: Truck, label: "Livraison rapide" },
  { icon: Zap, label: "Produits connectés" },
  { icon: Leaf, label: "Local & artisanal" },
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: Gift, label: "-30% sur sélection" },
  { icon: Package, label: "Stock disponible" },
  { icon: Star, label: "Clients satisfaits" },
];

export default function Marquee() {
  const doubled = [...chips, ...chips];

  return (
    <section className="bg-[#ECFDF5] border-y border-emerald-100 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 mx-6 text-sm font-medium text-emerald-700"
          >
            <chip.icon className="w-4 h-4 shrink-0" />
            {chip.label}
          </span>
        ))}
      </div>
    </section>
  );
}
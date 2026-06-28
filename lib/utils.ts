import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "XAF", locale: string = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `HC-${year}-${random}`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getLocalizedField(
  field: Record<string, string> | unknown,
  locale: string
): string {
  if (typeof field === "object" && field !== null) {
    const obj = field as Record<string, string>;
    return obj[locale] ?? obj["fr"] ?? Object.values(obj)[0] ?? "";
  }
  return String(field ?? "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function getStatusLabel(status: string, locale: string = "fr"): string {
  const labels: Record<string, Record<string, string>> = {
    PENDING: { fr: "En attente", en: "Pending" },
    CONFIRMED: { fr: "Confirmée", en: "Confirmed" },
    SHIPPED: { fr: "Expédiée", en: "Shipped" },
    DELIVERED: { fr: "Livrée", en: "Delivered" },
    CANCELLED: { fr: "Annulée", en: "Cancelled" },
  };
  return labels[status]?.[locale] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    SHIPPED: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
  };
  return colors[status] ?? "bg-gray-50 text-gray-700";
}

// Promo helpers
export function getEffectivePrice(price: number, originalPrice: number | null | undefined, promoEndsAt: Date | string | null | undefined): number {
  if (!originalPrice) return price;
  // Si date de fin dépassée, promo expirée → retourner originalPrice
  if (promoEndsAt && new Date(promoEndsAt) < new Date()) return originalPrice;
  return price;
}

export function isPromoActive(originalPrice: number | null | undefined, promoEndsAt: Date | string | null | undefined): boolean {
  if (!originalPrice) return false;
  if (promoEndsAt && new Date(promoEndsAt) < new Date()) return false;
  return true;
}

export function getPromoPercent(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}

// ─── Meta Pixel — Client Only ───────────────────────────────────────────────
// Utilisable uniquement dans des Client Components ("use client")

import type { MetaEventName, MetaEventData } from "./types";

/** Génère un event_id unique pour la déduplication Pixel ↔ CAPI */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Vérifie si fbq est disponible dans le navigateur */
function isFbqAvailable(): boolean {
  return typeof window !== "undefined" && typeof (window as Window & { fbq?: unknown }).fbq === "function";
}

/** Wrapper typé autour de fbq() */
export function trackPixelEvent(
  eventName: MetaEventName,
  eventId: string,
  data: Partial<Omit<MetaEventData, "event_name" | "event_id">> = {}
): void {
  if (!isFbqAvailable()) return;

  const fbq = (window as Window & { fbq: (...args: unknown[]) => void }).fbq;

  fbq("track", eventName, {
    currency: "XAF",
    ...data,
  }, {
    eventID: eventId, // Clé de déduplication
  });
}

/** Envoie un événement au endpoint serveur /api/meta/events (pour les Client Components) */
export async function sendClientEvent(
  eventName: MetaEventName,
  eventId: string,
  data: Partial<Omit<MetaEventData, "event_name" | "event_id">> = {}
): Promise<void> {
  try {
    await fetch("/api/meta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_data: data,
        url: window.location.href,
      }),
      keepalive: true, // Survit à la navigation
    });
  } catch (err) {
    console.warn("[Meta Pixel] sendClientEvent échoué:", err);
  }
}

/**
 * Déclenche un événement avec déduplication :
 * 1. Envoie fbq() au Pixel (navigateur)
 * 2. Envoie le même event_id à la CAPI via le serveur Next.js
 */
export function trackEvent(
  eventName: MetaEventName,
  data: Partial<Omit<MetaEventData, "event_name" | "event_id">> = {}
): string {
  const eventId = generateEventId();
  trackPixelEvent(eventName, eventId, data);
  void sendClientEvent(eventName, eventId, data);
  return eventId;
}

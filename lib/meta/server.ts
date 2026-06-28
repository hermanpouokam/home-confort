// ─── Meta Conversions API — Server Only ────────────────────────────────────
// NE JAMAIS importer ce fichier côté client

import crypto from "crypto";
import type { MetaEventName, MetaEventData, MetaUserData } from "./types";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const API_VERSION = "v21.0";

/** Hash une valeur en SHA-256 (normalisation incluse) */
export function hashValue(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/** Hash un numéro de téléphone : retire les espaces, garde le + */
export function hashPhone(phone: string): string {
  const normalized = phone.replace(/[\s\-().]/g, "");
  return hashValue(normalized);
}

/** Construit l'objet userData haché à partir de données brutes */
export function buildHashedUserData(raw: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}): MetaUserData {
  const userData: MetaUserData = {};

  if (raw.email) userData.em = hashValue(raw.email);
  if (raw.phone) userData.ph = hashPhone(raw.phone);
  if (raw.firstName) userData.fn = hashValue(raw.firstName);
  if (raw.lastName) userData.ln = hashValue(raw.lastName);
  if (raw.city) userData.ct = hashValue(raw.city);
  if (raw.country) userData.country = hashValue(raw.country);
  if (raw.ip) userData.client_ip_address = raw.ip;
  if (raw.userAgent) userData.client_user_agent = raw.userAgent;
  if (raw.fbc) userData.fbc = raw.fbc;
  if (raw.fbp) userData.fbp = raw.fbp;

  return userData;
}

interface SendCapiEventOptions {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  userData: MetaUserData;
  customData?: Partial<MetaEventData>;
  eventTime?: number;
}

/** Envoie un événement à la Meta Conversions API */
export async function sendCapiEvent(options: SendCapiEventOptions): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[Meta CAPI] NEXT_PUBLIC_META_PIXEL_ID ou META_ACCESS_TOKEN manquant");
    return;
  }

  const {
    eventName,
    eventId,
    eventSourceUrl,
    userData,
    customData = {},
    eventTime = Math.floor(Date.now() / 1000),
  } = options;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: "XAF",
          ...customData,
        },
      },
    ],
  };

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // On ne bloque pas le rendu si Meta est lent
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`[Meta CAPI] Erreur ${res.status}:`, error);
    } else {
      const json = await res.json();
      console.log(`[Meta CAPI] ${eventName} envoyé — event_id: ${eventId}`, json);
    }
  } catch (err) {
    // Ne jamais laisser une erreur Meta planter l'app
    console.error("[Meta CAPI] Échec silencieux:", err);
  }
}

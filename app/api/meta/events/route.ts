// app/api/meta/events/route.ts
// Reçoit les événements des Client Components et les transmet à la CAPI Meta

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendCapiEvent, buildHashedUserData } from "@/lib/meta/server";
import type { MetaEventName } from "@/lib/meta/types";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  event_name: z.enum([
    "PageView",
    "ViewContent",
    "AddToCart",
    "RemoveFromCart",
    "InitiateCheckout",
    "AddPaymentInfo",
    "Purchase",
    "Search",
  ]),
  event_id: z.string().min(1),
  event_data: z.record(z.unknown()).optional(),
  url: z.string().url().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const { event_name, event_id, event_data = {}, url } = parsed.data;

    // Extraire les cookies Meta du navigateur
    const fbc = req.cookies.get("_fbc")?.value;
    const fbp = req.cookies.get("_fbp")?.value;

    // IP et User-Agent pour améliorer le match rate
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const userData = buildHashedUserData({
      ip,
      userAgent,
      fbc,
      fbp,
    });

    const eventSourceUrl =
      url ?? req.headers.get("referer") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

    await sendCapiEvent({
      eventName: event_name as MetaEventName,
      eventId: event_id,
      eventSourceUrl,
      userData,
      customData: event_data as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/meta/events] Erreur:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

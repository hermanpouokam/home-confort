"use client";

import { useEffect } from "react";
import { trackPixelEvent } from "@/lib/meta/pixel";

interface ViewContentTrackerProps {
  eventId: string;
  productId: string;
  productName: string;
  price: number;
}

/**
 * Composant invisible — déclenche fbq("ViewContent") avec l'event_id
 * généré côté serveur pour la déduplication avec la CAPI.
 */
export default function ViewContentTracker({
  eventId,
  productId,
  productName,
  price,
}: ViewContentTrackerProps) {
  useEffect(() => {
    trackPixelEvent("ViewContent", eventId, {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      currency: "XAF",
      value: price,
    });
    // Une seule fois au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

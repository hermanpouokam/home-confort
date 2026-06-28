"use client";

import { useEffect } from "react";
import { trackPixelEvent } from "@/lib/meta/pixel";

interface InitiateCheckoutTrackerProps {
  eventId: string;
  total: number;
  numItems: number;
  contentIds: string[];
}

export default function InitiateCheckoutTracker({
  eventId,
  total,
  numItems,
  contentIds,
}: InitiateCheckoutTrackerProps) {
  useEffect(() => {
    trackPixelEvent("InitiateCheckout", eventId, {
      currency: "XAF",
      value: total,
      num_items: numItems,
      content_ids: contentIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

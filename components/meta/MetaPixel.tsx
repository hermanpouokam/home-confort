"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { generateEventId, sendClientEvent } from "@/lib/meta/pixel";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Déclenche PageView à chaque changement de route */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PIXEL_ID) return;

    const eventId = generateEventId();

    // fbq PageView (navigateur)
    if (typeof window !== "undefined") {
      const win = window as Window & { fbq?: (...args: unknown[]) => void };
      if (win.fbq) {
        win.fbq("track", "PageView", {}, { eventID: eventId });
      }
    }

    // CAPI PageView (serveur)
    void sendClientEvent("PageView", eventId, {});
  }, [pathname, searchParams]);

  return null;
}

/** Composant principal à placer dans le layout racine */
export default function MetaPixel() {
  if (!PIXEL_ID) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID non défini — tracking désactivé");
    }
    return null;
  }

  return (
    <>
      {/* Script Pixel Meta — chargé après hydratation, hors render critique */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `,
        }}
      />

      {/* Fallback noscript */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* PageView tracker — Suspense requis car useSearchParams est dans un Client Component */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

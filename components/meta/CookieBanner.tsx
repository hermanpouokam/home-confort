"use client";

import { useState, useEffect } from "react";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";

const CONSENT_KEY = "hc_cookie_consent";

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function storeConsent(consent: ConsentState): void {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  // Émettre un événement custom pour que MetaPixel puisse réagir
  window.dispatchEvent(new CustomEvent("hc:consent", { detail: consent }));
}

/** Hook exportable — vérifie si le marketing est consenti */
export function useMarketingConsent(): boolean {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored?.marketing) setConsented(true);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      setConsented(detail.marketing);
    };

    window.addEventListener("hc:consent", handler);
    return () => window.removeEventListener("hc:consent", handler);
  }, []);

  return consented;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: true });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored?.decided) {
      // Délai léger pour éviter le flash au premier rendu
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    storeConsent({ analytics: true, marketing: true, decided: true });
    setVisible(false);
  };

  const rejectAll = () => {
    storeConsent({ analytics: false, marketing: false, decided: true });
    setVisible(false);
  };

  const savePrefs = () => {
    storeConsent({ ...prefs, decided: true });
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#E8E8E3] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-5 pb-4">
          <div className="w-10 h-10 bg-[#F4F4F1] rounded-xl flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-[#111210] text-base mb-1">
              Nous respectons votre vie privée
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience, mesurer nos audiences
              et personnaliser nos publicités (Meta / Facebook). Vous pouvez choisir librement.
            </p>
          </div>
          <button
            onClick={rejectAll}
            aria-label="Refuser et fermer"
            className="p-1.5 rounded-xl hover:bg-[#F4F4F1] transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        {/* Détails personnalisables */}
        {showDetails && (
          <div className="px-5 pb-4 space-y-3 border-t border-[#E8E8E3] pt-4">
            {/* Nécessaires — toujours actifs */}
            <div className="flex items-center justify-between py-2 px-3 bg-[#F4F4F1] rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#111210]">Cookies essentiels</p>
                <p className="text-xs text-[#9CA3AF]">Panier, session, sécurité — toujours actifs</p>
              </div>
              <div className="w-9 h-5 bg-emerald-400 rounded-full flex items-center justify-end pr-0.5 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between py-2 px-3 bg-[#F4F4F1] rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#111210]">Cookies analytiques</p>
                <p className="text-xs text-[#9CA3AF]">Mesure d'audience, statistiques de navigation</p>
              </div>
              <button
                role="switch"
                aria-checked={prefs.analytics}
                onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  prefs.analytics ? "bg-emerald-400 justify-end" : "bg-[#D1D5DB] justify-start"
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all" />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between py-2 px-3 bg-[#F4F4F1] rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#111210]">Cookies marketing</p>
                <p className="text-xs text-[#9CA3AF]">
                  Publicités personnalisées Meta/Facebook, suivi e-commerce
                </p>
              </div>
              <button
                role="switch"
                aria-checked={prefs.marketing}
                onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  prefs.marketing ? "bg-emerald-400 justify-end" : "bg-[#D1D5DB] justify-start"
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 px-5 pb-5 pt-3">
          <button
            onClick={acceptAll}
            className="btn-primary text-sm px-5 py-2 h-auto"
          >
            Tout accepter
          </button>
          <button
            onClick={rejectAll}
            className="btn-ghost text-sm px-5 py-2 h-auto"
          >
            Tout refuser
          </button>
          {showDetails ? (
            <button
              onClick={savePrefs}
              className="btn-ghost text-sm px-5 py-2 h-auto text-emerald-600 border-emerald-200"
            >
              Enregistrer mes choix
            </button>
          ) : null}
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            {showDetails ? (
              <>Masquer les détails <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Personnaliser <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

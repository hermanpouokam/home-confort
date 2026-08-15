import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

// Hostname exact du sous-domaine admin (ex: "admin.homeconfort.cm").
// Si non défini, on retombe sur la détection par préfixe "admin." (pratique en local avec /etc/hosts).
const ADMIN_HOSTNAME = process.env.ADMIN_HOSTNAME;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const isProd = process.env.NODE_ENV === "production";

  // Les routes API ne sont jamais concernées par la logique de sous-domaine
  // (le back-office et le site vitrine partagent la même API).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isAdminHost = ADMIN_HOSTNAME
    ? hostname === ADMIN_HOSTNAME
    : hostname.startsWith("benjamin.");

  if (isAdminHost) {
    // Sur le sous-domaine admin : "/" renvoie directement au dashboard,
    // et seules les routes /admin/* sont accessibles.
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (!pathname.startsWith("/admin")) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  // Sur le domaine principal (boutique) : /admin est totalement inaccessible.
  // En développement local (pas de vrai sous-domaine), on laisse passer pour pouvoir tester.
  if (pathname.startsWith("/admin")) {
    if (!isProd) return NextResponse.next();
    return new NextResponse("Not Found", { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Toutes les routes sauf :
    // - _next (internes Next.js)
    // - _vercel (internes Vercel)
    // - fichiers statiques (avec extension)
    // (/api et /admin sont désormais gérés explicitement dans la fonction ci-dessus)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};

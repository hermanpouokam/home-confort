import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except:
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - files with extensions (static files)
    // - api routes (handled above)
    "/((?!_next|_vercel|api|admin|.*\\..*).*)",
  ],
};

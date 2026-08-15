import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Accepte localhost ET tout domaine configuré dans NEXT_PUBLIC_SITE_URL
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXT_PUBLIC_SITE_URL
          ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
          : "",
        process.env.ADMIN_HOSTNAME ?? "",
      ].filter(Boolean),
    },
  },
};

export default withNextIntl(nextConfig);

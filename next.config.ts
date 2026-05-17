import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

import { PAGE_ROUTES } from "./src/shared/constants/routes";
import { defaultLocale, supportedLocales } from "./src/shared/i18n/config";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");
const INTERNAL_PUBLIC_ROOT = "/public";
const secondaryLocalePattern = supportedLocales
  .filter((locale) => locale !== defaultLocale)
  .join("|");
const publicPageRewrites = [
  {
    source: PAGE_ROUTES.HOME,
    destination: `${INTERNAL_PUBLIC_ROOT}/${defaultLocale}`,
  },
  {
    source: PAGE_ROUTES.LEGAL,
    destination: `${INTERNAL_PUBLIC_ROOT}/${defaultLocale}${PAGE_ROUTES.LEGAL}`,
  },
  {
    source: `${PAGE_ROUTES.LEGAL}/:path*`,
    destination: `${INTERNAL_PUBLIC_ROOT}/${defaultLocale}${PAGE_ROUTES.LEGAL}/:path*`,
  },
  {
    source: `/:locale(${secondaryLocalePattern})`,
    destination: `${INTERNAL_PUBLIC_ROOT}/:locale`,
  },
  {
    source: `/:locale(${secondaryLocalePattern})${PAGE_ROUTES.LEGAL}`,
    destination: `${INTERNAL_PUBLIC_ROOT}/:locale${PAGE_ROUTES.LEGAL}`,
  },
  {
    source: `/:locale(${secondaryLocalePattern})${PAGE_ROUTES.LEGAL}/:path*`,
    destination: `${INTERNAL_PUBLIC_ROOT}/:locale${PAGE_ROUTES.LEGAL}/:path*`,
  },
];

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRemotePatterns = (() => {
  if (!supabaseUrl) {
    return [];
  }

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    const base = {
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      ...(port ? { port } : {}),
    };

    return [
      { ...base, pathname: "/storage/v1/object/public/**" },
      { ...base, pathname: "/storage/v1/object/sign/**" },
    ];
  } catch {
    return [];
  }
})();

const ONE_DAY_IN_SECONDS = 86_400;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: ONE_DAY_IN_SECONDS,
      static: ONE_DAY_IN_SECONDS,
    },
    optimizePackageImports: ["next-intl"],
  },
  /**
   * Public URLs keep the default locale unprefixed (`/`, `/legal`)
   * and use `/{locale}` only for secondary locales (`/en`, `/es`).
   * Files live under `app/public/[locale]/…` to avoid clashing with `app/(protected)/[projectId]`.
   */
  rewrites: async () => publicPageRewrites,
  sassOptions: {
    includePaths: [path.join(__dirname, "./src/styles")],
  },
  images: {
    remotePatterns: supabaseRemotePatterns,
    minimumCacheTTL: ONE_DAY_IN_SECONDS,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
      ],
    },
    {
      source: "/(workspace|account)",
      headers: [{ key: "Cache-Control", value: "private, no-cache" }],
    },
  ],
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["192.168.1.3"],
  }),
};

const sentryBuildOptions = {
  org: "lesot-cyril",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
  telemetry: false,
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default withSentryConfig(
  withBundleAnalyzer(withNextIntl(nextConfig)),
  sentryBuildOptions
);

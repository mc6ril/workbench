import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRemotePattern = (() => {
  if (!supabaseUrl) {
    return null;
  }

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    const basePattern = {
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };

    return port ? { ...basePattern, port } : basePattern;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  /**
   * Public SEO URLs use `/{locale}` (`/fr`, `/en`, `/es`).
   * Files live under `app/marketing/[locale]/…` to avoid clashing with `app/(protected)/[projectId]`.
   */
  rewrites: async () => {
    return [
      {
        source: "/:locale(fr|en|es)",
        destination: "/marketing/:locale",
      },
      {
        source: "/:locale(fr|en|es)/pricing",
        destination: "/marketing/:locale/pricing",
      },
      {
        source: "/:locale(fr|en|es)/legal",
        destination: "/marketing/:locale/legal",
      },
      {
        source: "/:locale(fr|en|es)/legal/:path*",
        destination: "/marketing/:locale/legal/:path*",
      },
    ];
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "./src/styles")],
  },
  images: {
    remotePatterns: supabaseRemotePattern ? [supabaseRemotePattern] : [],
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
      ],
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
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryBuildOptions
);

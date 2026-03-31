import { NextResponse } from "next/server";

import { getMessages } from "@/shared/i18n/messages";
import type { Locale } from "@/shared/i18n/types";
import { buildManifest } from "@/shared/seo/buildManifest";

const isLocale = (value: string): value is Locale => {
  return value === "fr" || value === "en" || value === "es";
};

type Params = {
  locale: string;
};

export const GET = async (
  _request: Request,
  { params }: { params: Promise<Params> }
) => {
  const { locale } = await params;
  const resolvedLocale: Locale = isLocale(locale) ? locale : "fr";
  const messages = getMessages(resolvedLocale);
  const manifest = buildManifest(resolvedLocale, messages);

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};


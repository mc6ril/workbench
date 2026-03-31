import { ImageResponse } from "next/og";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import { getTranslationValue } from "@/shared/i18n/utils";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const OpengraphImage = async () => {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const title =
    getTranslationValue(messages, "app.metadata", "title") ?? PRODUCT_BRAND_NAME;
  const subtitle =
    getTranslationValue(messages, "app.metadata", "description") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #2a1f1a 0%, #4a3b32 55%, #faf7f4 100%)",
          color: "#faf7f4",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            opacity: 0.95,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
            color: "#e8e0d9",
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...size }
  );
};

export default OpengraphImage;

import type { Metadata, Viewport } from "next";

import { getIntlLocale, getTranslationValue } from "@/shared/i18n";
import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import AppProvider from "@/shared/providers/AppProvider";

import "@/styles/global.scss";

const getAppMetadata = async (): Promise<Metadata> => {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  const appTitle = getTranslationValue(messages, "app.metadata", "title");
  const appDescription = getTranslationValue(
    messages,
    "app.metadata",
    "description"
  );

  if (!appTitle) {
    throw new Error("Missing translation: app.metadata.title");
  }

  if (!appDescription) {
    throw new Error("Missing translation: app.metadata.description");
  }

  return {
    title: appTitle,
    description: appDescription,
  };
};

export const generateMetadata = async (): Promise<Metadata> => {
  return getAppMetadata();
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f1a" },
  ],
  viewportFit: "cover",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const locale = await getRequestLocale();

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <AppProvider initialLocale={locale}>
          <div className="app-root">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;

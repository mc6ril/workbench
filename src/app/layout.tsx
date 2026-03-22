import type { Metadata } from "next";

import type { TranslationMessages } from "@/shared/i18n";
import { defaultLocale, getTranslationValue } from "@/shared/i18n";
import messagesFr from "@/shared/i18n/messages/fr.json";
import AppProvider from "@/shared/providers/AppProvider";

import "@/styles/global.scss";

const messages = messagesFr as TranslationMessages;

const appTitle = getTranslationValue(messages, "app.metadata", "title");
const appDescription = getTranslationValue(messages, "app.metadata", "description");

if (!appTitle) {
  throw new Error("Missing translation: app.metadata.title");
}

if (!appDescription) {
  throw new Error("Missing translation: app.metadata.description");
}

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>
        <AppProvider>
          <div className="app-root">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;

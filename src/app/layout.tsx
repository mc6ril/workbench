import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";

import AppProvider from "@/shared/providers/AppProvider";

import type { TranslationMessages } from "@/shared/i18n";
import { defaultLocale, getTranslationValue } from "@/shared/i18n";
import messagesFr from "@/shared/i18n/messages/fr.json";

import "@/styles/global.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantSerif = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorantSerif.variable}`}
      >
        <AppProvider>
          <div className="app-root">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;

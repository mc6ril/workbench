import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";

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
    <html lang={defaultLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <div className="app-root">{children}</div>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;

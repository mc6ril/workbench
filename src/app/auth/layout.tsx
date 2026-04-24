import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import AppProvider from "@/shared/providers/AppProvider";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";
import { getThemePreferenceFromCookie } from "@/shared/theme/config";

export const metadata: Metadata = noIndexMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f1a" },
  ],
  viewportFit: "cover",
  initialScale: 1,
  maximumScale: 1,
};

const AuthPagesLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const initialTheme = getThemePreferenceFromCookie(cookieStore);

  return (
    <RequestIntlProvider>
      <AppProvider initialTheme={initialTheme}>{children}</AppProvider>
    </RequestIntlProvider>
  );
};

export default AuthPagesLayout;

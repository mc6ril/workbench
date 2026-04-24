import type { Metadata } from "next";
import { cookies } from "next/headers";
import { dehydrate } from "@tanstack/react-query";

import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";
import { getThemePreferenceFromCookie } from "@/shared/theme/config";

export const metadata: Metadata = noIndexMetadata;

/**
 * Server-side layout for authenticated routes in the `(protected)` route group.
 * Authentication is enforced in `middleware.ts` (Edge) and ultimately by database RLS.
 */
const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const queryClient = createAppQueryClient();
  const cookieStore = await cookies();
  const initialTheme = getThemePreferenceFromCookie(cookieStore);

  return (
    <RequestIntlProvider>
      <AppProvider
        dehydratedState={dehydrate(queryClient)}
        initialTheme={initialTheme}
      >
        {children}
      </AppProvider>
    </RequestIntlProvider>
  );
};

export default ProtectedLayout;

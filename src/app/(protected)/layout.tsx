import type { Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";

import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";

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

  return (
    <RequestIntlProvider>
      <AppProvider dehydratedState={dehydrate(queryClient)}>
        {children}
      </AppProvider>
    </RequestIntlProvider>
  );
};

export default ProtectedLayout;

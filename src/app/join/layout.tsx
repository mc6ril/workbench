import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import AppProvider from "@/shared/providers/AppProvider";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";
import { getThemePreferenceFromCookie } from "@/shared/theme/config";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = noIndexMetadata;

const JoinLayout = async ({ children }: Props) => {
  const cookieStore = await cookies();
  const initialTheme = getThemePreferenceFromCookie(cookieStore);

  return (
    <RequestIntlProvider>
      <AppProvider initialTheme={initialTheme}>{children}</AppProvider>
    </RequestIntlProvider>
  );
};

export default JoinLayout;

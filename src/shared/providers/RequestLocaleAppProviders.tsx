import type { DehydratedState } from "@tanstack/react-query";

import { getRequestLocale } from "@/shared/i18n/requestLocale";

import AppProvider from "./AppProvider";
import LocaleOnlyProvider from "./LocaleOnlyProvider";

type RequestLocaleAppProvidersProps = {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
};

const RequestLocaleAppProviders = async ({
  children,
  dehydratedState,
}: RequestLocaleAppProvidersProps) => {
  const locale = await getRequestLocale();

  return (
    <LocaleOnlyProvider initialLocale={locale}>
      <AppProvider dehydratedState={dehydratedState}>{children}</AppProvider>
    </LocaleOnlyProvider>
  );
};

export default RequestLocaleAppProviders;

import { getRequestLocale } from "@/shared/i18n/requestLocale";

import AppProvider from "./AppProvider";
import LocaleOnlyProvider from "./LocaleOnlyProvider";

type RequestLocaleAppProvidersProps = {
  children: React.ReactNode;
};

const RequestLocaleAppProviders = async ({
  children,
}: RequestLocaleAppProvidersProps) => {
  const locale = await getRequestLocale();

  return (
    <LocaleOnlyProvider initialLocale={locale}>
      <AppProvider>{children}</AppProvider>
    </LocaleOnlyProvider>
  );
};

export default RequestLocaleAppProviders;

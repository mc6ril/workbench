import { redirect } from "next/navigation";

import { defaultLocale } from "@/shared/i18n/config";

/**
 * Root `/` is redirected by middleware to `/{resolvedLocale}`.
 * This fallback keeps behavior defined if middleware is bypassed.
 */
const RootPage = () => {
  redirect(`/${defaultLocale}`);
};

export default RootPage;

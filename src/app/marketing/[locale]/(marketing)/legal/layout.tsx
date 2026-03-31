import type { ReactNode } from "react";
import type { Metadata } from "next";

import { assertDefined } from "@/shared/errors/programmingError";
import { buildMarketingLegalPath } from "@/shared/i18n/marketingPaths";
import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import { getTranslationValue } from "@/shared/i18n/utils";
import { buildPublicMetadata } from "@/shared/seo/buildPublicMetadata";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const title = getTranslationValue(messages, "pages.legal", "metadata.title");
  const description = getTranslationValue(
    messages,
    "pages.legal",
    "metadata.description"
  );

  assertDefined(title, "Missing translation: pages.legal.metadata.title");
  assertDefined(
    description,
    "Missing translation: pages.legal.metadata.description"
  );

  return buildPublicMetadata({
    locale,
    title,
    description,
    pathname: buildMarketingLegalPath(locale),
    buildPathForLocale: buildMarketingLegalPath,
  });
};

type Props = {
  children: ReactNode;
};

const LegalLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default LegalLayout;

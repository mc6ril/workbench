import LegalPage from "@/presentation/pages/legal";

import type { Locale } from "@/shared/i18n";

type Props = {
  params: Promise<{
    locale: Locale;
  }>;
};

const Legal = async ({ params }: Props) => {
  const { locale } = await params;
  return <LegalPage locale={locale} />;
};

export default Legal;

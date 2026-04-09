import { useCallback, useMemo } from "react";

import { getIntlLocale, useLocale, useTranslations } from "@/shared/i18n";
import { getLastUpdateContent } from "@/shared/utils";

/**
 * Returns a formatter that produces a human-readable "last activity" string
 * (e.g. "Last activity: just now", "Last activity: 2 days").
 * Usable for a single date or per-item in a list.
 */
export const useLastActivitySubtitle = (): ((
  updatedAt: Date | undefined,
  referenceDate?: Date
) => string) => {
  const t = useTranslations("pages.projectHome");
  const locale = useLocale();
  const intlLocale = useMemo(() => getIntlLocale(locale), [locale]);
  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [intlLocale]);

  return useCallback(
    (updatedAt: Date | undefined, referenceDate: Date = new Date()): string => {
      if (!updatedAt) {
        return "";
      }

      const { days, hours } = getLastUpdateContent(updatedAt, referenceDate);

      if (days >= 7) {
        return t("lastActivityDate", {
          date: dateFormatter.format(updatedAt),
        });
      }

      if (days >= 1) {
        return t("lastActivityDays", { days });
      }

      if (hours > 0) {
        return t("lastActivityHours", { hours });
      }

      return t("lastActivityNow");
    },
    [dateFormatter, t]
  );
};

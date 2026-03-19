import { useCallback } from "react";

import { useTranslation } from "@/shared/i18n";
import { getLastUpdateContent } from "@/shared/utils";

/**
 * Returns a formatter that produces a human-readable "last activity" string
 * (e.g. "Last activity: just now", "Last activity: 2 days").
 * Usable for a single date or per-item in a list.
 */
export const useLastActivitySubtitle = (): ((
  updatedAt: Date | undefined
) => string) => {
  const t = useTranslation("pages.projectHome");

  return useCallback(
    (updatedAt: Date | undefined): string => {
      if (!updatedAt) {
        return "";
      }

      const { days, hours } = getLastUpdateContent(updatedAt);

      if (days >= 7) {
        return t("lastActivityDate", {
          date: updatedAt.toLocaleDateString(),
        });
      }

      if (days >= 1) {
        return days === 1
          ? t("lastActivityDays", { days })
          : t("lastActivityDays_plural", { days });
      }

      if (hours > 0) {
        return hours === 1
          ? t("lastActivityHours", { hours })
          : t("lastActivityHours_plural", { hours });
      }

      return t("lastActivityNow");
    },
    [t]
  );
};

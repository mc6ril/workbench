import { useMemo } from "react";

import { useTranslation } from "@/shared/i18n";
import { getLastUpdateContent } from "@/shared/utils";

/**
 * Computes a human-readable "last activity" subtitle for a project.
 * Returns hours, days, or a full date depending on how recent the activity was.
 */
export const useLastActivitySubtitle = (updatedAt: Date | undefined): string => {
  const t = useTranslation("pages.projectHome");

  return useMemo(() => {
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

    return "";
  }, [updatedAt, t]);
};

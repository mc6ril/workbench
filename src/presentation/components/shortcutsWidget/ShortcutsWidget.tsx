import React from "react";

import { Card, Link } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./ShortcutsWidget.module.scss";

type Shortcut = {
  label: string;
  route: string;
  icon?: React.ReactNode;
};

type Props = {
  projectId: string;
  translationNamespace?: "pages.home.shortcutsWidget" | "pages.projectHome.shortcutsWidget";
  shortcuts?: Shortcut[];
  onShortcutClick?: (route: string) => void;
  className?: string;
};

const ShortcutsWidget = ({
  projectId,
  translationNamespace = "pages.home.shortcutsWidget",
  shortcuts,
  onShortcutClick,
  className,
}: Props) => {
  const t = useTranslation(translationNamespace);
  const widgetId = getAccessibilityId("shortcuts-widget");

  const defaultShortcuts: Shortcut[] = [
    { label: t("shortcuts.board"), route: PROJECT_VIEWS.BOARD },
    { label: t("shortcuts.backlog"), route: PROJECT_VIEWS.BACKLOG },
    { label: t("shortcuts.epics"), route: PROJECT_VIEWS.EPICS },
    { label: t("shortcuts.settings"), route: PROJECT_VIEWS.SETTINGS },
  ];

  const displayShortcuts = shortcuts || defaultShortcuts;

  const handleShortcutClick = (route: string): void => {
    if (onShortcutClick) {
      onShortcutClick(route);
    }
  };

  const widgetClasses = [styles["shortcuts-widget"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      title={t("title")}
      className={widgetClasses}
      ariaLabel={t("title")}
    >
      <nav
        id={widgetId}
        className={styles["shortcuts-widget__nav"]}
        aria-label={t("title")}
      >
        <ul className={styles["shortcuts-widget__list"]}>
          {displayShortcuts.map((shortcut) => {
            const route = buildProjectRoute(projectId, shortcut.route);

            return (
              <li key={shortcut.route} className={styles["shortcuts-widget__item"]}>
                <Link
                  href={route}
                  ariaLabel={shortcut.label}
                  className={styles["shortcuts-widget__link"]}
                  onClick={() => {
                    handleShortcutClick(shortcut.route);
                  }}
                >
                  {shortcut.icon && (
                    <span
                      className={styles["shortcuts-widget__icon"]}
                      aria-hidden="true"
                    >
                      {shortcut.icon}
                    </span>
                  )}
                  <span className={styles["shortcuts-widget__label"]}>
                    {shortcut.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
};

export default ShortcutsWidget;
"use client";

import React, { useCallback, useMemo, useRef } from "react";

import { Title } from "@/presentation/components/ui";

import {
  ARIA_ORIENTATION_VALUES,
  ARIA_ROLES,
  ARIA_SELECTED_VALUES,
  getAccessibilityId,
} from "@/shared/a11y/constants";
import { handleKeyboardNavigation } from "@/shared/a11y/utilities";
import { useTranslation } from "@/shared/i18n";

import styles from "./SettingsLayout.module.scss";

export type SettingsTab = {
  id: string;
  label: string;
  isDisabled?: boolean;
};

type Props = {
  tabs: SettingsTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
};

const SettingsLayout = ({
  tabs,
  activeTabId,
  onTabChange,
  children,
  className,
}: Props) => {
  const t = useTranslation("pages.settings.layout");

  const layoutId = useMemo(() => getAccessibilityId("settings-layout"), []);
  const tabListId = `${layoutId}-tablist`;
  const panelId = `${layoutId}-panel`;

  const enabledTabs = useMemo(
    () => tabs.filter((tab) => tab.isDisabled !== true),
    [tabs]
  );

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = useCallback((tabId: string): void => {
    const button = tabRefs.current[tabId];
    if (button) {
      button.focus();
    }
  }, []);

  const setTabRef = useCallback(
    (tabId: string) => (element: HTMLButtonElement | null) => {
      tabRefs.current[tabId] = element;
    },
    []
  );

  const getNextEnabledTabId = useCallback(
    (currentTabId: string, direction: "next" | "previous"): string | null => {
      if (enabledTabs.length === 0) {
        return null;
      }

      const currentIndex = enabledTabs.findIndex(
        (tab) => tab.id === currentTabId
      );
      if (currentIndex === -1) {
        return enabledTabs[0].id;
      }

      const delta = direction === "next" ? 1 : -1;
      const nextIndex =
        (currentIndex + delta + enabledTabs.length) % enabledTabs.length;
      return enabledTabs[nextIndex]?.id ?? null;
    },
    [enabledTabs]
  );

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, tabId: string): void => {
      handleKeyboardNavigation(event.nativeEvent, {
        onArrowLeft: () => {
          const nextId = getNextEnabledTabId(tabId, "previous");
          if (!nextId) {
            return;
          }
          onTabChange(nextId);
          focusTab(nextId);
        },
        onArrowRight: () => {
          const nextId = getNextEnabledTabId(tabId, "next");
          if (!nextId) {
            return;
          }
          onTabChange(nextId);
          focusTab(nextId);
        },
        onArrowUp: () => {
          const nextId = getNextEnabledTabId(tabId, "previous");
          if (!nextId) {
            return;
          }
          onTabChange(nextId);
          focusTab(nextId);
        },
        onArrowDown: () => {
          const nextId = getNextEnabledTabId(tabId, "next");
          if (!nextId) {
            return;
          }
          onTabChange(nextId);
          focusTab(nextId);
        },
      });

      if (event.key === "Home") {
        event.preventDefault();
        const first = enabledTabs[0]?.id;
        if (first) {
          onTabChange(first);
          focusTab(first);
        }
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        const last = enabledTabs[enabledTabs.length - 1]?.id;
        if (last) {
          onTabChange(last);
          focusTab(last);
        }
      }
    },
    [enabledTabs, focusTab, getNextEnabledTabId, onTabChange]
  );

  const containerClasses = [styles["settings-layout"], className]
    .filter(Boolean)
    .join(" ");

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const activeTabButtonId = activeTab
    ? getAccessibilityId(`settings-tab-${activeTab.id}`)
    : undefined;

  return (
    <section className={containerClasses} aria-labelledby={layoutId}>
      <header className={styles["settings-layout__header"]}>
        <Title
          id={layoutId}
          variant="h1"
          className={styles["settings-layout__title"]}
        >
          {t("title")}
        </Title>
      </header>

      <div className={styles["settings-layout__body"]}>
        <nav
          className={styles["settings-layout__nav"]}
          aria-label={t("tabsNavAriaLabel")}
        >
          <div
            id={tabListId}
            role={ARIA_ROLES.TABLIST}
            aria-orientation={ARIA_ORIENTATION_VALUES.HORIZONTAL}
            className={styles["settings-layout__tablist"]}
          >
            {tabs.map((tab) => {
              const isSelected = tab.id === activeTabId;
              const isDisabled = tab.isDisabled === true;
              const tabButtonId = getAccessibilityId(`settings-tab-${tab.id}`);

              return (
                <button
                  key={tab.id}
                  ref={setTabRef(tab.id)}
                  type="button"
                  id={tabButtonId}
                  role={ARIA_ROLES.TAB}
                  tabIndex={isSelected ? 0 : -1}
                  aria-selected={
                    isSelected
                      ? ARIA_SELECTED_VALUES.TRUE
                      : ARIA_SELECTED_VALUES.FALSE
                  }
                  aria-controls={isSelected ? panelId : undefined}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  className={[
                    styles["settings-layout__tab"],
                    isSelected && styles["settings-layout__tab--active"],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onTabChange(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div
          id={panelId}
          role={ARIA_ROLES.TABPANEL}
          aria-labelledby={activeTabButtonId}
          className={styles["settings-layout__panel"]}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default React.memo(SettingsLayout);

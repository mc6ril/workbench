"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import NavigationItem from "@/presentation/components/ui/NavigationItem";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./SidebarNavigation.module.scss";

type Props = {
  projectId: string;
};

type SidebarItem = {
  key: "home" | "backlog" | "board" | "epics" | "settings";
  href: string;
  label: string;
};

const normalizePath = (path: string): string => {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
};

const isActiveHref = (
  pathname: string,
  href: string,
  options?: { exactOnly?: boolean }
): boolean => {
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(href);

  if (normalizedPathname === normalizedHref) {
    return true;
  }

  if (options?.exactOnly) {
    return false;
  }

  return normalizedPathname.startsWith(`${normalizedHref}/`);
};

const SidebarNavigation = ({ projectId }: Props) => {
  const pathname = usePathname();
  const t = useTranslation("navigation.sidebar");

  const navListId = getAccessibilityId("sidebar-navigation-list");

  const items: SidebarItem[] = useMemo(
    () => [
      {
        key: "home",
        href: `/${projectId}`,
        label: t("items.home"),
      },
      {
        key: "backlog",
        href: `/${projectId}/backlog`,
        label: t("items.backlog"),
      },
      {
        key: "board",
        href: `/${projectId}/board`,
        label: t("items.board"),
      },
      {
        key: "epics",
        href: `/${projectId}/epics`,
        label: t("items.epics"),
      },
      {
        key: "settings",
        href: `/${projectId}/settings`,
        label: t("items.settings"),
      },
    ],
    [projectId, t]
  );

  return (
    <div className={styles["sidebar-navigation"]}>
      <ul id={navListId} className={styles["sidebar-navigation__list"]}>
        {items.map((item) => (
          <NavigationItem
            key={item.key}
            href={item.href}
            label={item.label}
            active={isActiveHref(pathname, item.href, {
              exactOnly: item.key === "home",
            })}
          />
        ))}
      </ul>
    </div>
  );
};

export default React.memo(SidebarNavigation);

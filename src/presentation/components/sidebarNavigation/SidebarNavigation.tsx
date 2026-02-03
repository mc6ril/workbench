"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import NavigationItem from "@/presentation/components/ui/NavigationItem";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./SidebarNavigation.module.scss";

import {
  buildProjectViewHref,
  getProjectViewConfigsForSidebar,
} from "@/configs/projectRoutes";

type Props = {
  projectId: string;
};

type SidebarItem = {
  key: string;
  href: string;
  label: string;
  exactOnly: boolean;
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

  const items: SidebarItem[] = useMemo(() => {
    const configs = getProjectViewConfigsForSidebar();
    return configs.map((config) => ({
      key: config.key,
      href: buildProjectViewHref(projectId, config.key),
      label: t(`items.${config.sidebarLabelKey}`),
      exactOnly: config.key === "home",
    }));
  }, [projectId, t]);

  return (
    <div className={styles["sidebar-navigation"]}>
      <ul id={navListId} className={styles["sidebar-navigation__list"]}>
        {items.map((item) => (
          <NavigationItem
            key={item.key}
            href={item.href}
            label={item.label}
            active={isActiveHref(pathname, item.href, {
              exactOnly: item.exactOnly,
            })}
          />
        ))}
      </ul>
    </div>
  );
};

export default React.memo(SidebarNavigation);

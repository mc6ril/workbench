"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import Link from "@/presentation/components/ui/Link";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./Breadcrumbs.module.scss";

type Props = {
  projectId: string;
};

type ViewKey = "home" | "backlog" | "board" | "epics" | "settings";

const getViewKeyFromPathname = (
  pathname: string,
  projectId: string
): ViewKey => {
  const projectPrefix = `/${projectId}`;

  if (!pathname.startsWith(projectPrefix)) {
    return "home";
  }

  const rest = pathname.slice(projectPrefix.length);
  const segment = rest.split("/").filter(Boolean)[0] ?? "";

  switch (segment) {
    case "backlog":
      return "backlog";
    case "board":
      return "board";
    case "epics":
      return "epics";
    case "settings":
      return "settings";
    default:
      return "home";
  }
};

const Breadcrumbs = ({ projectId }: Props) => {
  const pathname = usePathname();

  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const tSidebar = useTranslation("navigation.sidebar");

  const listId = getAccessibilityId("breadcrumbs-list");

  const currentViewKey = useMemo(
    () => getViewKeyFromPathname(pathname, projectId),
    [pathname, projectId]
  );

  const currentViewLabel = tSidebar(`items.${currentViewKey}`);
  const projectLabel = tBreadcrumbs("project");

  return (
    <ol id={listId} className={styles.breadcrumbs}>
      <li className={styles.breadcrumbs__item}>
        <Link href={`/${projectId}`}>{projectLabel}</Link>
      </li>
      <li className={styles.breadcrumbs__item} aria-current="page">
        <span className={styles.breadcrumbs__current}>{currentViewLabel}</span>
      </li>
    </ol>
  );
};

export default React.memo(Breadcrumbs);

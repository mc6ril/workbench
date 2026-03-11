"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import Link from "@/presentation/components/ui/Link";
import {
  buildProjectViewHref,
  getProjectViewConfig,
  getProjectViewKeyFromPath,
} from "@/presentation/navigation/projectViews.config";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";

import styles from "./Breadcrumbs.module.scss";

type Props = {
  projectId: string;
};

const Breadcrumbs = ({ projectId }: Props) => {
  const pathname = usePathname();

  const tBreadcrumbs = useTranslation("navigation.breadcrumbs");
  const tSidebar = useTranslation("navigation.sidebar");

  const listId = getAccessibilityId("breadcrumbs-list");

  const currentViewKey = useMemo(
    () => getProjectViewKeyFromPath(pathname, projectId),
    [pathname, projectId]
  );

  const currentViewConfig = useMemo(
    () => getProjectViewConfig(currentViewKey),
    [currentViewKey]
  );

  const currentViewLabel = tSidebar(
    `items.${currentViewConfig.sidebarLabelKey}`
  );
  const projectLabel = tBreadcrumbs("project");
  const projectHref = buildProjectViewHref(projectId, PROJECT_VIEWS.BOARD);

  return (
    <ol id={listId} className={styles.breadcrumbs}>
      <li className={styles.breadcrumbs__item}>
        <Link href={projectHref}>{projectLabel}</Link>
      </li>
      <li className={styles.breadcrumbs__item} aria-current="page">
        <span className={styles.breadcrumbs__current}>{currentViewLabel}</span>
      </li>
    </ol>
  );
};

export default React.memo(Breadcrumbs);

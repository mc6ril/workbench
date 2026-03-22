"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Link from "@/shared/design-system/link";

import styles from "./Breadcrumbs.module.scss";

type Props = {
  projectHref: string;
  projectLabel: string;
  currentLabel: string;
};

const Breadcrumbs = ({ projectHref, projectLabel, currentLabel }: Props) => {
  const listId = getAccessibilityId("breadcrumbs-list");

  return (
    <ol id={listId} className={styles.breadcrumbs}>
      <li className={styles.breadcrumbs__item}>
        <Link href={projectHref}>{projectLabel}</Link>
      </li>
      <li className={styles.breadcrumbs__item} aria-current="page">
        <span className={styles.breadcrumbs__current}>{currentLabel}</span>
      </li>
    </ol>
  );
};

export default React.memo(Breadcrumbs);

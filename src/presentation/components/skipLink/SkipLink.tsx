"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./SkipLink.module.scss";

type Props = {
  targetId: string;
  label: string;
};

const SkipLink = ({ targetId, label }: Props) => {
  const skipLinkId = getAccessibilityId("skip-link");

  return (
    <a id={skipLinkId} className={styles["skip-link"]} href={`#${targetId}`}>
      {label}
    </a>
  );
};

export default React.memo(SkipLink);

import React from "react";

import styles from "./TicketPriorityDot.module.scss";

import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";

type Props = {
  priority: TicketPriority;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const TicketPriorityDot = ({
  priority,
  size = "md",
  className,
}: Props) => {
  const classes = [
    styles["ticket-priority-dot"],
    styles[`ticket-priority-dot--${priority}`],
    styles[`ticket-priority-dot--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span aria-hidden="true" className={classes} />;
};

export default React.memo(TicketPriorityDot);

"use client";

import React from "react";

import Avatar from "@/shared/design-system/avatar";
import Text from "@/shared/design-system/text";

type Props = {
  ticketCode?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  assigneeLabel: string;
  className?: string;
  assigneeClassName?: string;
  ticketCodeClassName?: string;
};

/**
 * Shared meta block for ticket cards/lists:
 * assignee avatar + optional ticket code.
 */
const TicketMeta = ({
  ticketCode,
  assigneeName,
  assigneeAvatarUrl,
  assigneeLabel,
  className,
  assigneeClassName,
  ticketCodeClassName,
}: Props) => {
  return (
    <div className={className}>
      <span className={assigneeClassName}>
        <Avatar
          src={assigneeAvatarUrl ?? "/default-profile.svg"}
          name={assigneeName}
          size="sm"
          aria-label={
            assigneeName ? `${assigneeLabel}: ${assigneeName}` : assigneeLabel
          }
        />
      </span>
      {ticketCode && (
        <Text as="span" variant="caption" className={ticketCodeClassName}>
          {ticketCode}
        </Text>
      )}
    </div>
  );
};

export default React.memo(TicketMeta);

import React from "react";

import Avatar from "@/shared/design-system/avatar";
import Text from "@/shared/design-system/text";

import TicketPriorityDot from "./TicketPriorityDot";

import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";

type Props = {
  ticketCode?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: TicketPriority | null;
  assigneeLabel: string;
  className?: string;
  assigneeClassName?: string;
  ticketCodeClassName?: string;
  priorityDotClassName?: string;
};

/**
 * Shared meta block for ticket cards/lists:
 * assignee avatar + optional ticket code.
 */
const TicketMeta = ({
  ticketCode,
  assigneeName,
  assigneeAvatarUrl,
  priority,
  assigneeLabel,
  className,
  assigneeClassName,
  ticketCodeClassName,
  priorityDotClassName,
}: Props) => {
  return (
    <div className={className}>
      <span className={assigneeClassName}>
        <Avatar
          src={assigneeAvatarUrl}
          name={assigneeName}
          size="sm"
          aria-label={
            assigneeName ? `${assigneeLabel}: ${assigneeName}` : assigneeLabel
          }
        />
      </span>
      {priority ? (
        <TicketPriorityDot
          priority={priority}
          size="sm"
          className={priorityDotClassName}
        />
      ) : null}
      {ticketCode && (
        <Text
          as="span"
          variant="caption"
          className={ticketCodeClassName}
          aria-label={`ticket-code:${ticketCode}`}
        >
          {ticketCode}
        </Text>
      )}
    </div>
  );
};

export default React.memo(TicketMeta);

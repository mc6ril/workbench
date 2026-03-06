import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { BuildTicketAriaLabelParams } from "@/shared/types";

/**
 * Filters tickets by search term (case-insensitive).
 * Matches against ticket title and description.
 * Returns all tickets when search is empty or whitespace-only.
 */
export function filterTicketsBySearch(
  tickets: Ticket[],
  search: string
): Ticket[] {
  const term = search.trim().toLowerCase();
  if (term === "") {
    return tickets;
  }
  return tickets.filter((ticket) => {
    const titleMatch =
      ticket.title != null && ticket.title.toLowerCase().includes(term);
    const descriptionMatch =
      ticket.description != null &&
      ticket.description.toLowerCase().includes(term);
    return titleMatch || descriptionMatch;
  });
}

/**
 * Builds a human-readable ticket code from project short code and ticket number.
 * Returns null when project short code is unavailable.
 */
export const buildTicketCode = (
  projectShortCode: string | null | undefined,
  codeNumber: number
): string | null => {
  const normalizedShortCode = projectShortCode?.trim().toUpperCase();

  if (!normalizedShortCode) {
    return null;
  }

  return `${normalizedShortCode}-${codeNumber}`;
};

/**
 * Builds a consistent ARIA label for ticket UI representations.
 */
export const buildTicketAriaLabel = ({
  ticketAriaLabel,
  title,
  ticketCode,
  status,
  statusLabel,
  epicName,
  epicLabel,
  assigneeName,
  assigneeLabel,
  priority,
  priorityLabel,
  storyPointsLabel,
}: BuildTicketAriaLabelParams): string => {
  const parts: string[] = [title];

  if (ticketCode) {
    parts.push(ticketCode);
  }

  if (status && statusLabel) {
    parts.push(`${statusLabel}: ${status}`);
  }

  if (epicName && epicLabel) {
    parts.push(`${epicLabel}: ${epicName}`);
  }

  if (assigneeName && assigneeLabel) {
    parts.push(`${assigneeLabel}: ${assigneeName}`);
  }

  if (priority && priorityLabel) {
    parts.push(`${priorityLabel}: ${priority}`);
  }

  if (storyPointsLabel) {
    parts.push(storyPointsLabel);
  }

  return `${ticketAriaLabel}: ${parts.join(", ")}`;
};

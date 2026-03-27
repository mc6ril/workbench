import type { BuildTicketAriaLabelParams } from "@/modules/board/core/domain/types";

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
 * Keeps project-code-only searches (e.g. "WB") from hiding all tickets.
 * Such terms are treated as no-op ticket search.
 */
export const normalizeTicketSearch = (
  search: string,
  projectShortCode?: string | null
): string => {
  const term = search.trim();
  if (term === "") {
    return "";
  }

  const shortCode = projectShortCode?.trim().toLowerCase();
  if (!shortCode) {
    return search;
  }

  const normalizedTerm = term.toLowerCase();
  if (normalizedTerm === shortCode || normalizedTerm === `${shortCode}-`) {
    return "";
  }

  return search;
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

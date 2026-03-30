type BuildTicketAriaLabelParams = {
  ticketAriaLabel: string;
  title: string;
  ticketCode?: string | null;
  status?: string;
  statusLabel?: string;
  assigneeName?: string | null;
  assigneeLabel?: string;
  priority?: string | null;
  priorityLabel?: string;
  storyPointsLabel?: string;
};

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

export type ParsedTicketCodeForProject = {
  /**
   * Whether the parsed short code matches the provided project short code.
   */
  matchesProject: boolean;
  /**
   * Parsed code number when the input matches the expected pattern, otherwise
   * null.
   */
  codeNumber: number | null;
};

/**
 * Parse a human-readable ticket code (e.g. "WB-42") in the context of a
 * specific project.
 *
 * The short code prefix must match the provided project short code
 * case-insensitively. This helper never resolves a project from a short code;
 * it only helps extract the code number once the project is already known.
 */
export const parseTicketCodeForProject = (
  input: string,
  projectShortCode?: string | null
): ParsedTicketCodeForProject => {
  const raw = input.trim();
  const projectCode = projectShortCode?.trim();

  if (!raw || !projectCode) {
    return { matchesProject: false, codeNumber: null };
  }

  const match = /^([a-zA-Z0-9_-]+)-(\d+)$/.exec(raw);
  if (!match) {
    return { matchesProject: false, codeNumber: null };
  }

  const [, rawPrefix, rawNumber] = match;
  const matchesProject =
    rawPrefix.trim().toUpperCase() === projectCode.trim().toUpperCase();

  if (!matchesProject) {
    return { matchesProject: false, codeNumber: null };
  }

  const parsedNumber = Number(rawNumber);
  if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
    return { matchesProject: true, codeNumber: null };
  }

  return { matchesProject: true, codeNumber: parsedNumber };
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

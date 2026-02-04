/**
 * Derives display initials from an email address.
 * Examples:
 * - "j.doe@example.com" -> "JD"
 * - "john@example.com" -> "JO"
 *
 * @param email - Email address to derive initials from
 * @returns Uppercase initials or "?" when nothing can be derived
 */
export const getInitialsFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "";
  const parts = local.replace(/[._]/g, " ").trim().split(/\s+/);

  if (parts.length >= 2) {
    const firstInitial = (parts[0]?.[0] ?? "").toUpperCase();
    const secondInitial = (parts[1]?.[0] ?? "").toUpperCase();
    return `${firstInitial}${secondInitial}`;
  }

  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase();
  }

  if (local.length === 1) {
    return local.toUpperCase();
  }

  return "?";
};

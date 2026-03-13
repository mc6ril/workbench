/**
 * Build the internal route used to accept an invitation token.
 */
export const buildInvitationRoute = (token: string): string => {
  return `/join/${encodeURIComponent(token)}`;
};

/**
 * Extract an invitation token from:
 * - raw token input
 * - full URL containing /join/{token}
 * - full URL containing ?token={token}
 */
export const extractInvitationToken = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const tryParseAsUrl = (): string | null => {
    try {
      const parsed = new URL(trimmed);
      const tokenFromQuery = parsed.searchParams.get("token");
      if (tokenFromQuery) {
        return tokenFromQuery.trim();
      }

      const segments = parsed.pathname.split("/").filter(Boolean);
      const joinIndex = segments.findIndex((segment) => segment === "join");
      if (joinIndex >= 0 && segments[joinIndex + 1]) {
        return segments[joinIndex + 1].trim();
      }
    } catch {
      // Not a URL, fallback to raw token parsing.
    }

    return null;
  };

  const fromUrl = tryParseAsUrl();
  if (fromUrl) {
    return fromUrl;
  }

  const fromJoinPathMatch = trimmed.match(/\/join\/([^/?#]+)/i);
  if (fromJoinPathMatch?.[1]) {
    return fromJoinPathMatch[1].trim();
  }

  return trimmed;
};

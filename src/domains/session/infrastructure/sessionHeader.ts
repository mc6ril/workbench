import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { isCurrentSession } from "@/domains/session/infrastructure/sessionIdentity";

export const SESSION_HEADER_NAME = "x-workbench-session";

export const encodeSessionHeader = (session: CurrentSession): string => {
  return encodeURIComponent(JSON.stringify(session));
};

export const decodeSessionHeader = (
  value?: string | null
): CurrentSession | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value));

    return isCurrentSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

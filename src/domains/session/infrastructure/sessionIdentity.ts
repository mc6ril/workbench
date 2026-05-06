import { isSupportedLocale } from "@/shared/i18n/config";
import { isNonEmptyString, isRecord, isString } from "@/shared/utils";

import type { CurrentSession } from "@/domains/session/core/domain/session.types";

type SessionIdentityInput = {
  userId?: string | null;
  email?: string | null;
  appMetadata?: Record<string, unknown> | null;
  userMetadata?: Record<string, unknown> | null;
};

const themeValues = new Set(["light", "dark", "system"]);

const getPreferences = (
  userMetadata?: Record<string, unknown> | null
): Record<string, unknown> | null => {
  const preferences = userMetadata?.preferences;

  return isRecord(preferences) ? preferences : null;
};

export const mapIdentityToCurrentSession = ({
  userId,
  email,
  userMetadata,
}: SessionIdentityInput): CurrentSession | null => {
  if (!userId || !email) {
    return null;
  }

  const preferences = getPreferences(userMetadata);
  const language = preferences?.language;
  const theme = preferences?.theme;
  const displayName = userMetadata?.display_name;
  const avatarUrl = userMetadata?.avatar_url;

  return {
    userId,
    loginEmail: email,
    ...(isString(displayName) && displayName.length > 0 ? { displayName } : {}),
    ...(isString(avatarUrl) && avatarUrl.length > 0 ? { avatarUrl } : {}),
    ...(isString(language) && isSupportedLocale(language) ? { language } : {}),
    ...(isString(theme) && themeValues.has(theme)
      ? { theme: theme as CurrentSession["theme"] }
      : {}),
  };
};

export const isCurrentSession = (value: unknown): value is CurrentSession => {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredFields =
    isNonEmptyString(value.userId) && isNonEmptyString(value.loginEmail);

  if (!hasRequiredFields) {
    return false;
  }

  if (
    "displayName" in value &&
    value.displayName !== undefined &&
    !isNonEmptyString(value.displayName)
  ) {
    return false;
  }

  if (
    "avatarUrl" in value &&
    value.avatarUrl !== undefined &&
    !isNonEmptyString(value.avatarUrl)
  ) {
    return false;
  }

  if (
    "language" in value &&
    value.language !== undefined &&
    !isNonEmptyString(value.language)
  ) {
    return false;
  }

  if ("theme" in value && value.theme !== undefined) {
    if (!isString(value.theme) || !themeValues.has(value.theme)) {
      return false;
    }
  }

  return true;
};

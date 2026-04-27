import { LIGHT_USER_COOKIE_NAME } from "@/shared/infrastructure/storage/userIdentityStorageKeys";
import { isNonEmptyString, isRecord } from "@/shared/utils";

export const lightUserCookieMaxAgeSeconds = 60 * 60 * 24 * 30;

export type LightUserCookieValue = {
  displayName?: string;
  avatarUrl?: string;
};

export const encodeLightUserCookie = (value: LightUserCookieValue): string => {
  return encodeURIComponent(JSON.stringify(value));
};

export const decodeLightUserCookie = (
  raw?: string | null
): LightUserCookieValue | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const displayName = parsed.displayName;
    const avatarUrl = parsed.avatarUrl;

    return {
      ...(isNonEmptyString(displayName) ? { displayName } : {}),
      ...(isNonEmptyString(avatarUrl) ? { avatarUrl } : {}),
    };
  } catch {
    return null;
  }
};

export const clearLightUserCookieInBrowser = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${LIGHT_USER_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const persistLightUserCookieInBrowser = (
  value: LightUserCookieValue
): void => {
  if (typeof document === "undefined") {
    return;
  }

  const encoded = encodeLightUserCookie(value);
  document.cookie = `${LIGHT_USER_COOKIE_NAME}=${encoded}; Path=/; Max-Age=${lightUserCookieMaxAgeSeconds}; SameSite=Lax`;
};

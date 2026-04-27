import { useMemo } from "react";

import { getCookie } from "@/shared/infrastructure/storage/cookies";
import { LIGHT_USER_COOKIE_NAME } from "@/shared/infrastructure/storage/userIdentityStorageKeys";

import {
  decodeLightUserCookie,
  type LightUserCookieValue,
} from "@/domains/session/infrastructure/lightUserCookie";

/**
 * Read a small "identity-lite" cookie (avatar/name) for instant UI bootstrap.
 * This is best-effort and may be empty on first load.
 */
export const useLightUserIdentity = (): LightUserCookieValue => {
  return useMemo(() => {
    const raw = getCookie(LIGHT_USER_COOKIE_NAME);
    return decodeLightUserCookie(raw) ?? {};
  }, []);
};

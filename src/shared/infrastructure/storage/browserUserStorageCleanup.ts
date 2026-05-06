import {
  IDENTITY_CACHE_STORAGE_KEY,
  LIGHT_USER_COOKIE_NAME,
} from "@/shared/infrastructure/storage/userIdentityStorageKeys";

const LEGACY_IDENTITY_CACHE_KEY = IDENTITY_CACHE_STORAGE_KEY;
const SUPABASE_AUTH_STORAGE_KEY_PATTERN = /^sb-[^-]+-auth-token(?:-user)?$/;

const isBrowser = (): boolean => typeof window !== "undefined";

export const isUserStorageKey = (key: string): boolean => {
  return (
    key === LEGACY_IDENTITY_CACHE_KEY ||
    SUPABASE_AUTH_STORAGE_KEY_PATTERN.test(key)
  );
};

export const cleanupBrowserUserStorage = (): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
      Object.keys(storage)
        .filter(isUserStorageKey)
        .forEach((key) => {
          storage.removeItem(key);
        });
    });

    document.cookie = `${LIGHT_USER_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // Storage cleanup is best-effort; auth state is kept in cookies.
  }
};

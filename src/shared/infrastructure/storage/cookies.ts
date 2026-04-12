import { routing } from "../../i18n/routing";

export const APP_COOKIE_KEYS = Object.freeze({
  LOCALE:
    routing.localeCookie && typeof routing.localeCookie === "object"
      ? (routing.localeCookie.name ?? "workbench-locale")
      : "workbench-locale",
  RUNTIME_CONFIG_OVERRIDES: "workbench-runtime-config-overrides",
});

type CookieStoreLike = {
  get(name: string): { value?: string } | undefined;
};

type CookieSource = string | CookieStoreLike;

type CookieWriteOptions = {
  path?: string;
  maxAgeSeconds?: number;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

const readCookieValueFromHeader = (
  cookieHeader: string,
  cookieName: string
): string | undefined => {
  if (!cookieHeader.trim()) {
    return undefined;
  }

  const cookieParts = cookieHeader.split(";");

  for (const cookiePart of cookieParts) {
    const trimmedPart = cookiePart.trim();
    const separatorIndex = trimmedPart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedPart.slice(0, separatorIndex).trim();
    if (name !== cookieName) {
      continue;
    }

    return trimmedPart.slice(separatorIndex + 1);
  }

  return undefined;
};

const buildCookieString = (
  name: string,
  value: string,
  options?: CookieWriteOptions
): string => {
  const cookieSegments = [
    `${name}=${value}`,
    `Path=${options?.path ?? "/"}`,
    `SameSite=${options?.sameSite ?? "Lax"}`,
  ];

  if (typeof options?.maxAgeSeconds === "number") {
    cookieSegments.push(`Max-Age=${options.maxAgeSeconds}`);
  }

  if (options?.secure) {
    cookieSegments.push("Secure");
  }

  return cookieSegments.join("; ");
};

export const getCookie = (
  name: string,
  source?: CookieSource
): string | undefined => {
  const cookieSource =
    source ?? (typeof document === "undefined" ? undefined : document.cookie);

  if (!cookieSource) {
    return undefined;
  }

  if (typeof cookieSource === "string") {
    return readCookieValueFromHeader(cookieSource, name);
  }

  const cookieValue = cookieSource.get(name)?.value;
  return typeof cookieValue === "string" ? cookieValue : undefined;
};

export const updateCookie = (
  name: string,
  value: string,
  options?: CookieWriteOptions
): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildCookieString(name, value, options);
};

export const resetCookie = (
  name: string,
  options?: Omit<CookieWriteOptions, "maxAgeSeconds">
): void => {
  updateCookie(name, "", {
    ...options,
    maxAgeSeconds: 0,
  });
};

import {
  APP_COOKIE_KEYS,
  getCookie,
} from "@/shared/infrastructure/storage/cookies";

export type RuntimeConfigBooleanOverrides = Record<string, boolean>;

const parseSerializedOverrides = (
  serializedValue?: string
): RuntimeConfigBooleanOverrides => {
  if (!serializedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(
      decodeURIComponent(serializedValue)
    ) as unknown;

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter((entry): entry is [string, boolean] => {
        return typeof entry[0] === "string" && typeof entry[1] === "boolean";
      })
    );
  } catch {
    return {};
  }
};

export const readRuntimeConfigBooleanOverridesFromCookieValue = (
  cookieValue?: string
): RuntimeConfigBooleanOverrides => {
  return parseSerializedOverrides(cookieValue);
};

export const readRuntimeConfigBooleanOverridesFromCookieHeader = (
  cookieHeader: string
): RuntimeConfigBooleanOverrides => {
  return parseSerializedOverrides(
    getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, cookieHeader)
  );
};

export const serializeRuntimeConfigBooleanOverrides = (
  overrides: RuntimeConfigBooleanOverrides
): string => {
  return encodeURIComponent(JSON.stringify(overrides));
};

export const getRuntimeConfigBooleanOverride = (
  overrides: RuntimeConfigBooleanOverrides,
  key: string
): boolean | undefined => {
  const value = overrides[key];
  return typeof value === "boolean" ? value : undefined;
};

export const getRuntimeConfigEvaluationCacheTag = ({
  overrideValue,
}: {
  overrideValue?: boolean;
}): string => {
  if (overrideValue === true) {
    return "override:true";
  }

  if (overrideValue === false) {
    return "override:false";
  }

  return "standard";
};

export const withRuntimeConfigBooleanOverride = ({
  overrides,
  key,
  value,
  remoteValue,
}: {
  overrides: RuntimeConfigBooleanOverrides;
  key: string;
  value: boolean;
  remoteValue: boolean;
}): RuntimeConfigBooleanOverrides => {
  const nextOverrides = { ...overrides };

  if (value === remoteValue) {
    delete nextOverrides[key];
    return nextOverrides;
  }

  nextOverrides[key] = value;
  return nextOverrides;
};

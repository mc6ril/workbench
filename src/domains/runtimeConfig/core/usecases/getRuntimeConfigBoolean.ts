import type { RuntimeConfigPort } from "@/domains/runtimeConfig/core/ports/runtimeConfig.port";

type Input = {
  key: string;
  defaultValue: boolean;
  overrideValue?: boolean;
};

/**
 * Reads a boolean runtime config value from the remote config table.
 * Fails closed to defaultValue when unavailable or when the value is not a boolean.
 */
export const getRuntimeConfigBoolean = async (
  runtimeConfigPort: RuntimeConfigPort,
  input: Input
): Promise<boolean> => {
  if (typeof input.overrideValue === "boolean") {
    return input.overrideValue;
  }

  try {
    const value = await runtimeConfigPort.getValue(input.key);
    if (typeof value !== "boolean") {
      return input.defaultValue;
    }
    return value;
  } catch {
    return input.defaultValue;
  }
};

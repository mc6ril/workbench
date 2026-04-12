import type { RuntimeConfigEntry } from "@/domains/runtimeConfig/core/domain/runtimeConfig.types";
import type { RuntimeConfigPort } from "@/domains/runtimeConfig/core/ports/runtimeConfig.port";

/**
 * Lists all runtime config entries currently exposed by the shared config table.
 */
export const listRuntimeConfigEntries = async (
  runtimeConfigPort: RuntimeConfigPort
): Promise<RuntimeConfigEntry[]> => {
  return runtimeConfigPort.listEntries();
};

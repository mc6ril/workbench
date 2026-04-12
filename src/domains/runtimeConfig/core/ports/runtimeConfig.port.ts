import type { RuntimeConfigEntry } from "@/domains/runtimeConfig/core/domain/runtimeConfig.types";

export type RuntimeConfigPort = {
  getValue(key: string): Promise<unknown>;
  listEntries(): Promise<RuntimeConfigEntry[]>;
};

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";

const CACHE_VERSION = "v1";

// Deployed: Vercel sets this automatically. Locally: "dev" keeps cache warm across restarts.
const BUILD_BUSTER = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev";

export { BUILD_BUSTER };

export const createQueryPersister = (userId: string) =>
  createAsyncStoragePersister({
    storage: {
      getItem: (key: string) => get<string>(key).then((v) => v ?? null),
      setItem: (key: string, value: string) => set(key, value),
      removeItem: (key: string) => del(key),
    },
    // Per-user key prevents cross-account cache bleed.
    key: `workbench-query-${CACHE_VERSION}-${userId}`,
  });

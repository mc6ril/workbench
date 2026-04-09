import { useQuery } from "@tanstack/react-query";

import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import { runtimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/runtimeConfig/presentation/hooks/queryKeys";

export const useRuntimeConfigBoolean = (key: string, defaultValue: boolean) => {
  return useQuery({
    queryKey: queryKeys.runtimeConfig.boolean(key),
    queryFn: () => getRuntimeConfigBoolean(runtimeConfigPort, { key, defaultValue }),
  });
};


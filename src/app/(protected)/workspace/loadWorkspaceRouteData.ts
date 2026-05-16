import { dehydrate } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { getSessionData } from "@/domains/auth/infrastructure/supabase/getSessionData.server";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

export const loadWorkspaceRouteData = async () => {
  const queryClient = createAppQueryClient();
  const [supabaseClient, session] = await Promise.all([
    createSupabaseServerClient(),
    getSessionData(),
  ]);
  const displayName = session.displayName;
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);

  await queryClient.prefetchQuery({
    queryKey: workspaceQueryKeys.projects.withStats(),
    queryFn: () => listProjectsWithStats(workspaceProjectCatalogGateway),
  });

  return {
    dehydratedState: dehydrate(queryClient),
    displayName,
    referenceTimeIso: new Date().toISOString(),
  };
};

import { dehydrate } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { requireCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

export const loadWorkspaceRouteData = async () => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);
  const identity = await requireCurrentAuthIdentity(supabaseClient);
  const displayName = identity.displayName?.trim() || null;

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

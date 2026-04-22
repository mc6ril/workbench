import { dehydrate } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { createProfileGateway } from "@/domains/profile/infrastructure/profileGateway.supabase";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

export const loadWorkspaceRouteData = async () => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const sessionGateway = createSessionGateway(supabaseClient);
  const profileGateway = createProfileGateway(supabaseClient);
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);
  const session = await getCurrentSession(sessionGateway);
  const profile = await getProfile(profileGateway, session.userId);
  const displayName = profile?.displayName?.trim() || null;

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

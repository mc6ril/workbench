import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { queryKeys as billingQueryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";
import WorkspacePage from "@/domains/workspace/presentation/pages/workspace";

const WorkspaceRoutePage = async () => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);
  const billingVisibilityPort = createBillingVisibilityPort(supabaseClient);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: workspaceQueryKeys.projects.withStats(),
      queryFn: () => listProjectsWithStats(workspaceProjectCatalogGateway),
    }),
    queryClient.prefetchQuery({
      queryKey: workspaceQueryKeys.projects.reclaimable(),
      queryFn: () => listReclaimableProjects(workspaceProjectCatalogGateway),
    }),
    queryClient.prefetchQuery({
      queryKey: billingQueryKeys.config.billingVisibility(),
      queryFn: () => getBillingVisibility(billingVisibilityPort),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspacePage referenceTimeIso={new Date().toISOString()} />
    </HydrationBoundary>
  );
};

export default WorkspaceRoutePage;

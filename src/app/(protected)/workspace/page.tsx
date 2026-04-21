import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { localeCookieName, resolveLocale } from "@/shared/i18n";
import { messageCatalog } from "@/shared/i18n/messageCatalog";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";
import WorkspacePage from "@/domains/workspace/presentation/pages/workspace";

export const generateMetadata = async (): Promise<Metadata> => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const workspaceMessages = messageCatalog[locale].pages.workspace;

  return {
    title: workspaceMessages.title,
    description: workspaceMessages.subtitle,
  };
};

const WorkspaceRoutePage = async () => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);

  await queryClient.prefetchQuery({
    queryKey: workspaceQueryKeys.projects.withStats(),
    queryFn: () => listProjectsWithStats(workspaceProjectCatalogGateway),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspacePage referenceTimeIso={new Date().toISOString()} />
    </HydrationBoundary>
  );
};

export default WorkspaceRoutePage;

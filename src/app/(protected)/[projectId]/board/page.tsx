import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { getProjectShortCode } from "@/modules/board/core/usecases/project/getProjectShortCode";
import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import {
  createBoardRepository,
  createProjectLookupRepository,
  createTicketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import BoardPageContent from "@/modules/board/presentation/pages/board";

type BoardPageDataProps = {
  projectId: string;
};

const BoardPageData = async ({ projectId }: BoardPageDataProps) => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const boardRepository = createBoardRepository(supabaseClient);
  const ticketRepository = createTicketRepository(supabaseClient);
  const projectLookupRepository = createProjectLookupRepository(supabaseClient);
  const memberGateway = createProjectMemberGateway(supabaseClient);

  // All secondary queries fire in parallel before blocking on boardConfig.
  // They run concurrently with boardConfig and land in the dehydrated state
  // if they complete within that window (they always will — simpler queries).
  // HydrationBoundary then injects all completed data into the client cache
  // before the first client render, preventing hydration mismatches.
  void queryClient.prefetchQuery({
    queryKey: queryKeys.projects.ticketsList(projectId),
    queryFn: () => listTickets(ticketRepository, projectId),
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
    queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
  });
  void queryClient.prefetchQuery({
    queryKey: projectQueryKeys.members.byProject(projectId),
    queryFn: () => listProjectMembers(memberGateway, projectId),
  });

  const [initialBoardConfiguration, initialProjectShortCode] =
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: queryKeys.projects.boardConfiguration(projectId),
        queryFn: () => getBoardConfiguration(boardRepository, projectId),
      }),
      queryClient.fetchQuery({
        queryKey: queryKeys.projects.shortCode(projectId),
        queryFn: () => getProjectShortCode(projectLookupRepository, projectId),
      }),
    ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardPageContent
        projectId={projectId}
        initialBoardConfiguration={initialBoardConfiguration}
        initialProjectShortCode={initialProjectShortCode}
      />
    </HydrationBoundary>
  );
};

const BoardPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <BoardPageData projectId={projectId} />
    </Suspense>
  );
};

export default BoardPage;

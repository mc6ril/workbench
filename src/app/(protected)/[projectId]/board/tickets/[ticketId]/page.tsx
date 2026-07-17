import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { listComments } from "@/modules/board/core/usecases/comment/listComments";
import { getTicketDetail } from "@/modules/board/core/usecases/ticket/getTicketDetail";
import {
  createCommentRepository,
  createTicketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import TicketDetailPage from "@/modules/board/presentation/pages/ticket";

type DataProps = { projectId: string; ticketId: string };

const BoardTicketDetailPageData = async ({
  projectId,
  ticketId,
}: DataProps) => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const ticketRepository = createTicketRepository(supabaseClient);
  const commentRepository = createCommentRepository(supabaseClient);
  const memberGateway = createProjectMemberGateway(supabaseClient);

  // Not needed for first paint: fired here so it still lands in the dehydrated
  // state if it resolves before the awaited queries below, but never blocks them.
  // Members are usually already cached from the board visit (staleTime: Infinity);
  // this only matters for direct/deep links straight into a ticket.
  void queryClient.prefetchQuery({
    queryKey: projectQueryKeys.members.byProject(projectId),
    queryFn: () => listProjectMembers(memberGateway, projectId),
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.comments.byTicket(ticketId),
    queryFn: () => listComments(ticketId, commentRepository),
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.detail(ticketId),
      queryFn: () => getTicketDetail(ticketRepository, ticketId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.assignees(ticketId),
      queryFn: () => ticketRepository.getAssignees(ticketId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TicketDetailPage projectId={projectId} ticketId={ticketId} />
    </HydrationBoundary>
  );
};

const BoardTicketDetailPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; ticketId: string }>;
}) => {
  const { projectId, ticketId } = await params;

  return (
    <Suspense>
      <BoardTicketDetailPageData projectId={projectId} ticketId={ticketId} />
    </Suspense>
  );
};

export default BoardTicketDetailPage;

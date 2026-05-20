import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

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

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.detail(ticketId),
      queryFn: () => getTicketDetail(ticketRepository, ticketId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.assignees(ticketId),
      queryFn: () => ticketRepository.getAssignees(ticketId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.comments.byTicket(ticketId),
      queryFn: () => listComments(ticketId, commentRepository),
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

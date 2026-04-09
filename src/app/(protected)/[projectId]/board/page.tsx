import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Loader from "@/shared/design-system/loader";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

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

const BoardPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const boardRepository = createBoardRepository(supabaseClient);
  const ticketRepository = createTicketRepository(supabaseClient);
  const projectLookupRepository = createProjectLookupRepository(supabaseClient);

  const [
    initialBoardConfiguration,
    initialTickets,
    initialTicketAssigneesByProjectId,
    initialProjectShortCode,
  ] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: queryKeys.projects.boardConfiguration(projectId),
      queryFn: () => getBoardConfiguration(boardRepository, projectId),
    }),
    queryClient.fetchQuery({
      queryKey: queryKeys.projects.ticketsList(projectId, undefined, undefined),
      queryFn: () => listTickets(ticketRepository, projectId),
    }),
    queryClient.fetchQuery({
      queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
      queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
    }),
    queryClient.fetchQuery({
      queryKey: queryKeys.projects.shortCode(projectId),
      queryFn: () => getProjectShortCode(projectLookupRepository, projectId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loader />}>
        <BoardPageContent
          projectId={projectId}
          initialBoardConfiguration={initialBoardConfiguration}
          initialTickets={initialTickets}
          initialTicketAssigneesByProjectId={initialTicketAssigneesByProjectId}
          initialProjectShortCode={initialProjectShortCode}
        />
      </Suspense>
    </HydrationBoundary>
  );
};

export default BoardPage;

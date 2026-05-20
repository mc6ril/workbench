import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import {
  createBoardRepository,
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

  // Fire-and-forget: starts in parallel with board config without blocking it.
  // If it resolves before board config, tickets are included in the dehydration
  // and useTickets reads from cache. Otherwise the client fetches as usual.
  void queryClient.prefetchQuery({
    queryKey: queryKeys.projects.ticketsList(projectId),
    queryFn: () => listTickets(ticketRepository, projectId),
  });

  const initialBoardConfiguration = await queryClient.fetchQuery({
    queryKey: queryKeys.projects.boardConfiguration(projectId),
    queryFn: () => getBoardConfiguration(boardRepository, projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardPageContent
        projectId={projectId}
        initialBoardConfiguration={initialBoardConfiguration}
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

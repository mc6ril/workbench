import TicketDetailPage from "@/modules/board/presentation/pages/ticket";

const BoardTicketDetailPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; ticketId: string }>;
}) => {
  const { projectId, ticketId } = await params;

  return <TicketDetailPage projectId={projectId} ticketId={ticketId} />;
};

export default BoardTicketDetailPage;

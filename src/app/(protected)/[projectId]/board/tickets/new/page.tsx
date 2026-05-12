import NewTicketPage from "@/modules/board/presentation/pages/ticket/NewTicketPage";

const BoardNewTicketPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return <NewTicketPage projectId={projectId} />;
};

export default BoardNewTicketPage;

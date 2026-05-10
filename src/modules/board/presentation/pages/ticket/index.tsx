"use client";

import TicketDetailView from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView";

type Props = {
  projectId: string;
  ticketId: string;
};

const TicketDetailPage = ({ projectId, ticketId }: Props) => {
  return <TicketDetailView projectId={projectId} ticketId={ticketId} />;
};

export default TicketDetailPage;

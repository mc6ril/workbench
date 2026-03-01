"use client";

import { use } from "react";

import TicketDetailPage from "@/presentation/pages/ticketDetail";

const ProjectTicketPage = ({
  params,
}: {
  params: Promise<{ projectId: string; ticketId: string }>;
}) => {
  const { projectId, ticketId } = use(params);

  return <TicketDetailPage projectId={projectId} ticketId={ticketId} />;
};

export default ProjectTicketPage;

"use client";

import { useCallback } from "react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildProjectRoute } from "@/shared/utils/routes";

import TicketDetailView from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView";

type Props = {
  projectId: string;
  ticketId: string;
};

const TicketDetailPage = ({ projectId, ticketId }: Props) => {
  const router = useAppRouter();

  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
  }, [projectId, router]);

  return (
    <TicketDetailView
      projectId={projectId}
      ticketId={ticketId}
      onClose={handleClose}
    />
  );
};

export default TicketDetailPage;

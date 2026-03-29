"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import TicketDetailView from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView";

type Props = {
  projectId: string;
  ticketId: string;
};

const TicketDetailPage = ({ projectId, ticketId }: Props) => {
  const router = useRouter();

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

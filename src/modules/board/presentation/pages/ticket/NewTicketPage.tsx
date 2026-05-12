"use client";

import { useEffect, useRef } from "react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import Loader from "@/shared/design-system/loader";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import {
  buildProjectRoute,
  buildTicketDetailRoute,
} from "@/shared/utils/routes";

import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useCreateTicket } from "@/modules/board/presentation/hooks/ticket/useCreateTicket";

type Props = {
  projectId: string;
};

const NewTicketPage = ({ projectId }: Props) => {
  const t = useTranslations("pages.board.newTicket");
  const router = useAppRouter();
  const { data: boardConfig } = useBoardConfiguration(projectId);
  const createTicket = useCreateTicket();
  const { canCreateTicket } = useProjectPermissions();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current || !boardConfig) return;

    if (!canCreateTicket) {
      router.replace(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
      return;
    }

    const firstColumn = boardConfig.columns[0];
    if (!firstColumn) {
      router.replace(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
      return;
    }

    hasTriggered.current = true;

    createTicket
      .mutateAsync({
        projectId,
        title: t("defaultTitle"),
        description: null,
        columnId: firstColumn.id,
        position: 0,
      })
      .then((ticket) => {
        router.replace(buildTicketDetailRoute(projectId, ticket.id));
      })
      .catch(() => {
        router.replace(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
      });
  }, [boardConfig, canCreateTicket, createTicket, projectId, router, t]);

  return <Loader variant="full-page" />;
};

export default NewTicketPage;

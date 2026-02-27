"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlanFeature } from "@/core/domain/rules/planFeatures.rules";

import CreateTicketForm from "@/presentation/components/createTicketForm/CreateTicketForm";
import TicketList from "@/presentation/components/ticketList/TicketList";
import Loader from "@/presentation/components/ui/Loader";
import Modal from "@/presentation/components/ui/Modal";
import Text from "@/presentation/components/ui/Text";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useProject } from "@/presentation/hooks/project/useProject";
import { useFeatureAccess } from "@/presentation/hooks/subscription/useFeatureAccess";
import { useCreateTicket } from "@/presentation/hooks/ticket/useCreateTicket";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";

import { useTranslation } from "@/shared/i18n";
import { buildTicketDetailRoute } from "@/shared/utils/routes";
import { buildTicketCode } from "@/shared/utils/ticketUtils";

type Props = {
  projectId: string;
};

const BacklogPage = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tBacklog = useTranslation("pages.backlog");
  const tCreateForm = useTranslation("pages.backlog.createTicketForm");
  const {
    data: tickets = [],
    isLoading,
    error,
  } = useTickets(projectId, {
    parentId: null,
  });
  const { data: epics = [] } = useEpics(projectId);
  const { data: project } = useProject(projectId);
  const { data: boardConfiguration, isLoading: isBoardConfigurationLoading } =
    useBoardConfiguration(projectId);
  const { hasAccess: hasEpicsAccess } = useFeatureAccess(PlanFeature.EPICS);
  const createTicketMutation = useCreateTicket();

  const ticketViewModels = useMemo(() => {
    const epicMap = new Map(epics.map((epic) => [epic.id, epic.name]));
    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      ticketCode: buildTicketCode(project?.shortCode, ticket.codeNumber),
      description: ticket.description ?? null,
      status: ticket.status,
      epicName: ticket.epicId ? (epicMap.get(ticket.epicId) ?? null) : null,
    }));
  }, [epics, tickets, project?.shortCode]);

  const isCreateTicketModalOpen = searchParams.get("createTicket") === "1";

  const statusOptions = useMemo(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

  const epicOptions = useMemo(() => {
    return epics.map((epic) => ({
      value: epic.id,
      label: epic.name,
    }));
  }, [epics]);

  const closeCreateTicketModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createTicket");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const createTicketErrorMessage =
    createTicketMutation.error instanceof Error
      ? createTicketMutation.error.message
      : undefined;

  if (isLoading) {
    return <Loader variant="full-page" />;
  }

  return (
    <>
      <TicketList
        tickets={ticketViewModels}
        errorMessage={error?.message}
        isEmpty={ticketViewModels.length === 0}
        onItemOpen={(ticketId) => {
          router.push(buildTicketDetailRoute(projectId, ticketId));
        }}
      />

      <Modal
        isOpen={isCreateTicketModalOpen}
        onClose={closeCreateTicketModal}
        title={tCreateForm("title")}
      >
        {isBoardConfigurationLoading ? (
          <Loader variant="inline" />
        ) : statusOptions.length === 0 ? (
          <Text variant="small">{tBacklog("subtitle")}</Text>
        ) : (
          <CreateTicketForm
            statusOptions={statusOptions}
            epicOptions={epicOptions}
            showEpicField={hasEpicsAccess}
            isSubmitting={createTicketMutation.isPending}
            errorMessage={createTicketErrorMessage}
            onCancel={closeCreateTicketModal}
            onSubmit={async (values) => {
              await createTicketMutation.mutateAsync({
                projectId,
                title: values.title,
                description: values.description ?? null,
                status: values.status,
                epicId: values.epicId ?? null,
                position: ticketViewModels.length,
              });

              closeCreateTicketModal();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default BacklogPage;

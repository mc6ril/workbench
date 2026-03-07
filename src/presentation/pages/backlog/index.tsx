"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
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
import { useTicketAssigneesByTicketIds } from "@/presentation/hooks/ticket/useTicketAssigneesByTicketIds";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { useTranslation } from "@/shared/i18n";
import { buildTicketCode, normalizeTicketSearch } from "@/shared/utils/ticketUtils";

const TicketDetailView = dynamic(
  () => import("@/presentation/components/ticketDetailView/TicketDetailView"),
  {
    ssr: false,
    loading: () => <Loader variant="inline" />,
  }
);

type Props = {
  projectId: string;
};

const BacklogPage = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tBacklog = useTranslation("pages.backlog");
  const tCreateForm = useTranslation("pages.backlog.createTicketForm");
  const tTicket = useTranslation("pages.ticketDetail.page");
  const search = useFilterStore((state) => state.search);
  const filters = useFilterStore((state) => state.filters);
  const sort = useSortStore((state) => state.sort);
  const { data: project } = useProject(projectId);
  const ticketFilters = useMemo(() => {
    return {
      ...filters,
      parentId: null,
    };
  }, [filters]);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, project?.shortCode);
  }, [project?.shortCode, search]);
  const {
    data: tickets = [],
    isLoading,
    error,
  } = useTickets(projectId, ticketFilters, sort, effectiveSearch);
  const { data: epics = [] } = useEpics(projectId);
  const { data: boardConfiguration, isLoading: isBoardConfigurationLoading } =
    useBoardConfiguration(projectId);
  const { hasAccess: hasEpicsAccess } = useFeatureAccess(PlanFeature.EPICS);
  const createTicketMutation = useCreateTicket();
  const ticketIds = useMemo(
    () => tickets.map((ticket) => ticket.id),
    [tickets]
  );
  const { data: assigneesByTicketId = {} } =
    useTicketAssigneesByTicketIds(ticketIds);

  const ticketViewModels = useMemo(() => {
    const epicMap = new Map(epics.map((epic) => [epic.id, epic.name]));
    return tickets.map((ticket) => ({
      assigneeAvatarUrl: assigneesByTicketId[ticket.id]?.[0]?.avatarUrl ?? null,
      assigneeName: assigneesByTicketId[ticket.id]?.[0]?.displayName ?? null,
      id: ticket.id,
      title: ticket.title,
      ticketCode: buildTicketCode(project?.shortCode, ticket.codeNumber),
      description: ticket.description ?? null,
      status: ticket.status,
      epicName: ticket.epicId ? (epicMap.get(ticket.epicId) ?? null) : null,
    }));
  }, [assigneesByTicketId, epics, project?.shortCode, tickets]);

  const isCreateTicketModalOpen = searchParams.get("createTicket") === "1";
  const selectedTicketId = searchParams.get("ticket");

  const updateSearchParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const closeCreateTicketModal = useCallback(() => {
    updateSearchParam("createTicket", null);
  }, [updateSearchParam]);

  const closeTicketDetailModal = useCallback(() => {
    updateSearchParam("ticket", null);
  }, [updateSearchParam]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const ticketModalTitle = useMemo(() => {
    const baseTitle = tTicket("title");
    if (!selectedTicket) {
      return baseTitle;
    }
    const ticketCode = tTicket("ticketCode", {
      code: selectedTicket.codeNumber,
    });
    return `${ticketCode} ${selectedTicket.title}`;
  }, [selectedTicket, tTicket]);

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
          updateSearchParam("ticket", ticketId);
        }}
      />

      <Modal
        isOpen={Boolean(selectedTicketId)}
        onClose={closeTicketDetailModal}
        title={ticketModalTitle}
        size="full"
      >
        {selectedTicketId && (
          <TicketDetailView
            key={selectedTicketId}
            projectId={projectId}
            ticketId={selectedTicketId}
          />
        )}
      </Modal>

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

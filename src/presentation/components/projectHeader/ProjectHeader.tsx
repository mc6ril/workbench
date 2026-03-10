"use client";

import { useMemo } from "react";

import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useLastActivitySubtitle } from "@/presentation/hooks/project/useLastActivitySubtitle";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";

type Props = {
  projectId: string;
  name: string;
  fallbackUpdatedAtIso: string;
};

const ProjectHeader = ({ projectId, name, fallbackUpdatedAtIso }: Props) => {
  const { data: epics = [] } = useEpics(projectId);
  const { data: tickets = [] } = useTickets(
    projectId,
    undefined,
    undefined,
    "",
    {
      useProjectWideCache: true,
    }
  );
  const fallbackUpdatedAt = useMemo(
    () => new Date(fallbackUpdatedAtIso),
    [fallbackUpdatedAtIso]
  );
  const lastActivityAt = useMemo(() => {
    const timestamps = [
      fallbackUpdatedAt.getTime(),
      ...epics.map((epic) => epic.updatedAt.getTime()),
      ...tickets.map((ticket) => ticket.updatedAt.getTime()),
    ].filter((value) => Number.isFinite(value));

    if (timestamps.length === 0) {
      return fallbackUpdatedAt;
    }

    return new Date(Math.max(...timestamps));
  }, [epics, fallbackUpdatedAt, tickets]);
  const formatLastActivity = useLastActivitySubtitle();
  const subtitle = formatLastActivity(lastActivityAt);

  return <DashboardHeader title={name} subtitle={subtitle} />;
};

export default ProjectHeader;

"use client";

import { useMemo } from "react";

import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import { useLastActivitySubtitle } from "@/presentation/hooks/project/useLastActivitySubtitle";

type Props = {
  name: string;
  updatedAtIso: string;
};

const ProjectHeader = ({ name, updatedAtIso }: Props) => {
  const updatedAt = useMemo(() => new Date(updatedAtIso), [updatedAtIso]);
  const subtitle = useLastActivitySubtitle(updatedAt);

  return <DashboardHeader title={name} subtitle={subtitle} />;
};

export default ProjectHeader;

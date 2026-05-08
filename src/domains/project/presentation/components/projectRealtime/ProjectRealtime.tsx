"use client";

import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useProjectRealtime } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime";

type Props = {
  projectId: string;
};

const ProjectRealtime = ({ projectId }: Props) => {
  const { data: boardConfiguration } = useBoardConfiguration(projectId);

  useProjectRealtime(projectId, boardConfiguration?.board.id);

  return null;
};

export default ProjectRealtime;

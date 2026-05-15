"use client";

import { useQuickListRealtime } from "@/modules/recipes/presentation/hooks/planner/useQuickListRealtime";

type Props = {
  projectId: string;
};

const RecipesRealtime = ({ projectId }: Props) => {
  useQuickListRealtime(projectId);
  return null;
};

export default RecipesRealtime;

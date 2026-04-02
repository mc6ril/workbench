"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { normalizePath } from "@/shared/utils/routes";

import { useRegisterProjectViewContribution } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import { getProjectViewKeyFromPath } from "@/domains/project/presentation/navigation/projectViews.config";
import { useRecipesShellContribution } from "@/modules/recipes/presentation/hooks/projectShell/useRecipesShellContribution";

type Props = {
  projectId: string;
};

const RecipesShellContributionAdapter = ({ projectId }: Props) => {
  const contribution = useRecipesShellContribution(projectId);

  useRegisterProjectViewContribution(contribution);

  return null;
};

const RecipesShellAdapter = ({ projectId }: Props) => {
  const pathname = usePathname();
  const currentViewKey = useMemo(() => {
    return getProjectViewKeyFromPath(normalizePath(pathname), projectId);
  }, [pathname, projectId]);

  if (currentViewKey !== PROJECT_VIEWS.RECIPES) {
    return null;
  }

  return <RecipesShellContributionAdapter projectId={projectId} />;
};

export default RecipesShellAdapter;

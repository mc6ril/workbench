"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  EMPTY_PROJECT_VIEW_CONTRIBUTION,
  type ProjectViewContribution,
} from "@/domains/project/core/domain/shell/projectViewContribution";

type ProjectShellContributionContextValue = {
  contribution: ProjectViewContribution;
  setContribution: (contribution: ProjectViewContribution) => void;
};

const ProjectShellContributionContext =
  createContext<ProjectShellContributionContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export const ProjectShellContributionProvider = ({
  children,
}: PropsWithChildren) => {
  const [contribution, setContribution] = useState<ProjectViewContribution>(
    EMPTY_PROJECT_VIEW_CONTRIBUTION
  );

  const handleSetContribution = useCallback(
    (nextContribution: ProjectViewContribution) => {
      setContribution(nextContribution);
    },
    []
  );

  const value = useMemo<ProjectShellContributionContextValue>(() => {
    return {
      contribution,
      setContribution: handleSetContribution,
    };
  }, [contribution, handleSetContribution]);

  return (
    <ProjectShellContributionContext.Provider value={value}>
      {children}
    </ProjectShellContributionContext.Provider>
  );
};

export const useProjectShellContribution = (): ProjectViewContribution => {
  const context = useContext(ProjectShellContributionContext);

  if (!context) {
    throw new Error(
      "useProjectShellContribution must be used within ProjectShellContributionProvider"
    );
  }

  return context.contribution;
};

export const useRegisterProjectViewContribution = (
  contribution: ProjectViewContribution
) => {
  const context = useContext(ProjectShellContributionContext);

  if (!context) {
    throw new Error(
      "useRegisterProjectViewContribution must be used within ProjectShellContributionProvider"
    );
  }

  const { setContribution } = context;

  useIsomorphicLayoutEffect(() => {
    setContribution(contribution);

    return () => {
      setContribution(EMPTY_PROJECT_VIEW_CONTRIBUTION);
    };
  }, [contribution, setContribution]);

  useEffect(() => {
    contribution.onMount?.();
  }, [contribution.onMount]);
};

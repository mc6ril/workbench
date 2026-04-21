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

import { assertDefined } from "@/shared/errors/programmingError";

import {
  EMPTY_PROJECT_VIEW_CONTRIBUTION,
  type ProjectViewContribution,
} from "@/domains/project/presentation/layouts/projectShell/projectViewContribution";

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

export const useRegisteredProjectShellContribution =
  (): ProjectViewContribution => {
    const context = useContext(ProjectShellContributionContext);

    assertDefined(
      context,
      "useRegisteredProjectShellContribution must be used within ProjectShellContributionProvider"
    );

    return context.contribution;
  };

export const useProjectShellContribution = (): ProjectViewContribution => {
  return useRegisteredProjectShellContribution();
};

export const useRegisterProjectViewContribution = (
  contribution: ProjectViewContribution
) => {
  const context = useContext(ProjectShellContributionContext);

  assertDefined(
    context,
    "useRegisterProjectViewContribution must be used within ProjectShellContributionProvider"
  );

  const { setContribution } = context;
  const onMount = contribution.onMount;

  useIsomorphicLayoutEffect(() => {
    setContribution(contribution);

    return () => {
      setContribution(EMPTY_PROJECT_VIEW_CONTRIBUTION);
    };
  }, [contribution, setContribution]);

  useEffect(() => {
    onMount?.();
  }, [onMount]);
};

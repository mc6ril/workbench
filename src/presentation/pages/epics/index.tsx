import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import EpicsList from "@/presentation/components/epicsList/EpicsList";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Loader from "@/presentation/components/ui/Loader";
import { useEpics } from "@/presentation/hooks/epic";
import { useFilterStore } from "@/presentation/stores/useFilterStore";

import { getAccessibilityId } from "@/shared/a11y";
import {
  filterEpicsByProgress,
  filterEpicsBySearch,
  sortEpics,
} from "@/shared/utils/epicUtils";

import styles from "./styles.module.scss";

type Props = {
  projectId: string;
};

const EpicsLayout = ({ projectId }: Props) => {
  const layoutId = useMemo(() => getAccessibilityId("epics-layout"), []);
  const searchParams = useSearchParams();
  const search = useFilterStore((state) => state.search);

  //fetch epics
  const { data: epics, isLoading, error } = useEpics(projectId);
  const epicProgressFilter = useMemo(() => {
    const value = searchParams.get("epicProgress");
    if (
      value === "all" ||
      value === "notStarted" ||
      value === "inProgress" ||
      value === "completed"
    ) {
      return value;
    }
    return "all" as const;
  }, [searchParams]);

  const epicSortField = useMemo(() => {
    const value = searchParams.get("epicSortField");
    if (
      value === "name" ||
      value === "createdAt" ||
      value === "updatedAt" ||
      value === "progress"
    ) {
      return value;
    }
    return "updatedAt" as const;
  }, [searchParams]);

  const epicSortDirection = useMemo(() => {
    const value = searchParams.get("epicSortDirection");
    if (value === "asc" || value === "desc") {
      return value;
    }
    return "desc" as const;
  }, [searchParams]);

  const visibleEpics = useMemo(() => {
    const withSearch = filterEpicsBySearch(epics ?? [], search);
    const withProgress = filterEpicsByProgress(withSearch, epicProgressFilter);
    return sortEpics(withProgress, epicSortField, epicSortDirection);
  }, [epicProgressFilter, epicSortDirection, epicSortField, epics, search]);

  if (isLoading) {
    return <Loader ariaLabel="Loading epics" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <section className={styles["epics-layout"]} aria-labelledby={layoutId}>
      <EpicsList epics={visibleEpics} />
    </section>
  );
};

export default EpicsLayout;

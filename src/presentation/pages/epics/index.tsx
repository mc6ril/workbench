import { useMemo } from "react";

import EpicsList from "@/presentation/components/epicsList/EpicsList";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Loader from "@/presentation/components/ui/Loader";
import { useEpics } from "@/presentation/hooks/epic";

import { getAccessibilityId } from "@/shared/a11y";

import styles from "./styles.module.scss";

type Props = {
  projectId: string;
};

const EpicsLayout = ({ projectId }: Props) => {
  const layoutId = useMemo(() => getAccessibilityId("epics-layout"), []);

  //fetch epics
  const { data: epics, isLoading, error } = useEpics(projectId);

  if (isLoading) {
    return <Loader ariaLabel="Loading epics" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <section className={styles["epics-layout"]} aria-labelledby={layoutId}>
      <EpicsList epics={epics ?? []} />
    </section>
  );
};

export default EpicsLayout;

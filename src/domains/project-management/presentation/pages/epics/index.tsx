import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import ErrorMessage from "@/shared/design-system/ErrorMessage";
import Loader from "@/shared/design-system/Loader";
import Modal from "@/shared/design-system/Modal";
import Text from "@/shared/design-system/Text";
import { useTranslation } from "@/shared/i18n";
import {
  filterEpicsByProgress,
  filterEpicsBySearch,
  sortEpics,
} from "@/shared/utils/epicUtils";

import styles from "./styles.module.scss";

import CreateEpicForm from "@/domains/project-management/presentation/components/epic/createEpicForm/CreateEpicForm";
import EpicsList from "@/domains/project-management/presentation/components/epic/epicsList/EpicsList";
import {
  useCreateEpic,
  useEpics,
} from "@/domains/project-management/presentation/hooks/epic";
import { useEpicQueryParams } from "@/domains/project-management/presentation/hooks/epic/useEpicQueryParams";
import { useProjectPermissions } from "@/domains/project-management/presentation/providers/permissions";
import { useFilterStore } from "@/domains/project-management/presentation/stores/useFilterStore";

type Props = {
  projectId: string;
};

const EpicsLayout = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const layoutId = useMemo(() => getAccessibilityId("epics-layout"), []);
  const searchParams = useSearchParams();
  const search = useFilterStore((state) => state.search);
  const tCreateForm = useTranslation("pages.epics.createEpicForm");
  const { canCreateEpic, isLoading: isPermissionsLoading } =
    useProjectPermissions();
  const createEpicMutation = useCreateEpic();

  //fetch epics
  const { data: epics, isLoading, error } = useEpics(projectId);
  const { epicProgressFilter, epicSortField, epicSortDirection } =
    useEpicQueryParams(searchParams);

  const visibleEpics = useMemo(() => {
    const withSearch = filterEpicsBySearch(epics ?? [], search);
    const withProgress = filterEpicsByProgress(withSearch, epicProgressFilter);
    return sortEpics(withProgress, epicSortField, epicSortDirection);
  }, [epicProgressFilter, epicSortDirection, epicSortField, epics, search]);
  const isCreateEpicModalOpen = searchParams.get("createEpic") === "1";
  const createEpicErrorMessage =
    createEpicMutation.error instanceof Error
      ? createEpicMutation.error.message
      : undefined;

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

  const closeCreateEpicModal = useCallback(() => {
    updateSearchParam("createEpic", null);
  }, [updateSearchParam]);

  const shouldShowFullPageLoader =
    isPermissionsLoading || (isLoading && epics === undefined);

  if (shouldShowFullPageLoader) {
    return <Loader ariaLabel="Loading epics" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <>
      <section className={styles["epics-layout"]} aria-labelledby={layoutId}>
        <EpicsList epics={visibleEpics} />
      </section>

      <Modal
        isOpen={isCreateEpicModalOpen}
        onClose={closeCreateEpicModal}
        title={tCreateForm("title")}
      >
        {!canCreateEpic ? (
          <Text variant="small">{tCreateForm("readOnlyHint")}</Text>
        ) : (
          <CreateEpicForm
            projectId={projectId}
            isSubmitting={createEpicMutation.isPending}
            errorMessage={createEpicErrorMessage}
            onCancel={closeCreateEpicModal}
            onSubmit={async (values) => {
              if (!canCreateEpic) {
                return;
              }

              await createEpicMutation.mutateAsync(values);
              closeCreateEpicModal();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default EpicsLayout;

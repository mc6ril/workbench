"use client";

import { use, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { getDefaultBoardConfiguration } from "@/modules/board/core/domain/rules/board.rules";

import Loader from "@/shared/design-system/Loader";
import { useTranslation } from "@/shared/i18n";

import { PlanFeature } from "@/domains/billing/core/domain/rules/planFeatures.rules";
import UpgradePrompt from "@/domains/billing/presentation/components/upgradePrompt/UpgradePrompt";
import { useFeatureAccess } from "@/domains/billing/presentation/hooks/useFeatureAccess";
import type { PriorityItem } from "@/modules/board/presentation/components/prioritiesSettings/PrioritiesSettings";
import type { StatusColumnItem } from "@/modules/board/presentation/components/statusesColumnsSettings/StatusesColumnsSettings";
import SettingsLayout from "@/domains/project/presentation/layouts/settingsLayout/SettingsLayout";

const ProjectSettings = dynamic(
  () =>
    import("@/domains/project/presentation/components/projectSettings/ProjectSettings"),
  { ssr: false }
);

const StatusesColumnsSettings = dynamic(
  () =>
    import("@/modules/board/presentation/components/statusesColumnsSettings/StatusesColumnsSettings"),
  { ssr: false }
);

const PrioritiesSettings = dynamic(
  () =>
    import("@/modules/board/presentation/components/prioritiesSettings/PrioritiesSettings"),
  { ssr: false }
);

const ExportImportSettings = dynamic(
  () =>
    import("@/modules/board/presentation/components/exportImportSettings/ExportImportSettings"),
  { ssr: false }
);

const SettingsPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);
  const t = useTranslation("pages.settings.page");
  const { hasAccess, minimumPlan, isLoading } = useFeatureAccess(
    PlanFeature.PRIORITIES
  );

  const [activeTabId, setActiveTabId] = useState<string>("project");
  const [statusColumns, setStatusColumns] = useState<StatusColumnItem[]>(() =>
    getDefaultBoardConfiguration(projectId).columns.map((column, index) => ({
      id: `${column.state}-${index}`,
      name: column.name,
      isEnabled: column.visible ?? true,
    }))
  );

  const tabs = useMemo(
    () => [
      { id: "project", label: t("tabs.project") },
      { id: "statusesColumns", label: t("tabs.statusesColumns") },
      { id: "priorities", label: t("tabs.priorities") },
      { id: "exportImport", label: t("tabs.exportImport") },
    ],
    [t]
  );

  const handleTabChange = useCallback((tabId: string): void => {
    setActiveTabId(tabId);
  }, []);

  const handleNoop = useCallback((): void => {}, []);
  const handleNoopChange = useCallback((_value: string): void => {}, []);
  const handleStatusColumnsChange = useCallback(
    (columns: StatusColumnItem[]): void => {
      setStatusColumns(columns);
    },
    []
  );
  const handleNoopPrioritiesChange = useCallback(
    (_priorities: PriorityItem[]): void => {},
    []
  );
  const handleNoopImportFile = useCallback((_file: File): void => {}, []);

  const content = useMemo(() => {
    switch (activeTabId) {
      case "project":
        return (
          <ProjectSettings
            projectName={projectId}
            projectDescription={null}
            onProjectNameChange={handleNoopChange}
            onProjectDescriptionChange={handleNoopChange}
            onSave={handleNoop}
            onReset={handleNoop}
          />
        );
      case "statusesColumns":
        return (
          <StatusesColumnsSettings
            columns={statusColumns}
            onChange={handleStatusColumnsChange}
            onCreate={handleNoop}
          />
        );
      case "priorities":
        return (
          <PrioritiesSettings
            priorities={[]}
            onChange={handleNoopPrioritiesChange}
            onCreate={handleNoop}
          />
        );
      case "exportImport":
        return (
          <ExportImportSettings
            onExport={handleNoop}
            onImportFile={handleNoopImportFile}
          />
        );
      default:
        return null;
    }
  }, [
    activeTabId,
    handleNoop,
    handleNoopChange,
    handleNoopImportFile,
    handleNoopPrioritiesChange,
    handleStatusColumnsChange,
    projectId,
    statusColumns,
  ]);

  if (isLoading) {
    return <Loader variant="full-page" />;
  }

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature={PlanFeature.PRIORITIES}
        minimumPlan={minimumPlan}
      />
    );
  }

  return (
    <SettingsLayout
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={handleTabChange}
    >
      {content || <p>{t("fallback")}</p>}
    </SettingsLayout>
  );
};

export default SettingsPage;

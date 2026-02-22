"use client";

import { use, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type { PriorityItem } from "@/presentation/components/prioritiesSettings/PrioritiesSettings";
import type { StatusColumnItem } from "@/presentation/components/statusesColumnsSettings/StatusesColumnsSettings";
import SettingsLayout from "@/presentation/layouts/settingsLayout/SettingsLayout";

const ProjectSettings = dynamic(
  () => import("@/presentation/components/projectSettings/ProjectSettings"),
  { ssr: false }
);

const StatusesColumnsSettings = dynamic(
  () =>
    import("@/presentation/components/statusesColumnsSettings/StatusesColumnsSettings"),
  { ssr: false }
);

const PrioritiesSettings = dynamic(
  () =>
    import("@/presentation/components/prioritiesSettings/PrioritiesSettings"),
  { ssr: false }
);

const ExportImportSettings = dynamic(
  () =>
    import("@/presentation/components/exportImportSettings/ExportImportSettings"),
  { ssr: false }
);

import { useTranslation } from "@/shared/i18n";

const SettingsPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);
  const t = useTranslation("pages.settings.page");

  const [activeTabId, setActiveTabId] = useState<string>("project");

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
  const handleNoopStatusColumnsChange = useCallback(
    (_columns: StatusColumnItem[]): void => {},
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
            columns={[]}
            onChange={handleNoopStatusColumnsChange}
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
    handleNoopStatusColumnsChange,
    projectId,
  ]);

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

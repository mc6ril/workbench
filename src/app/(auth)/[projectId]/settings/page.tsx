"use client";

import { use, useCallback, useMemo, useState } from "react";

import ExportImportSettings from "@/presentation/components/exportImportSettings/ExportImportSettings";
import type { PriorityItem } from "@/presentation/components/prioritiesSettings/PrioritiesSettings";
import PrioritiesSettings from "@/presentation/components/prioritiesSettings/PrioritiesSettings";
import ProjectSettings from "@/presentation/components/projectSettings/ProjectSettings";
import SettingsLayout from "@/presentation/components/settingsLayout/SettingsLayout";
import type {
  StatusColumnItem,
} from "@/presentation/components/statusesColumnsSettings/StatusesColumnsSettings";
import StatusesColumnsSettings from "@/presentation/components/statusesColumnsSettings/StatusesColumnsSettings";

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

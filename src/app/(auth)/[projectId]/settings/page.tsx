import ProjectSettingsPage from "@/domains/project/presentation/pages/settings/ProjectSettingsPage";

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return <ProjectSettingsPage projectId={projectId} />;
};

export default SettingsPage;

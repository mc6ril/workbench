import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  redirect(`/${projectId}/${PROJECT_VIEWS.BOARD}`);
};

export default SettingsPage;

import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { HydrationBoundary } from "@tanstack/react-query";

import { localeCookieName, resolveLocale } from "@/shared/i18n";
import { messageCatalog } from "@/shared/i18n/messageCatalog";

import { WorkspaceLoadingContent } from "./loading";
import { loadWorkspaceRouteData } from "./loadWorkspaceRouteData";

import { WorkspacePageRouteProvider } from "@/domains/workspace/presentation/pages/workspace/WorkspacePageRouteContext";

export const generateMetadata = async (): Promise<Metadata> => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const workspaceMessages = messageCatalog[locale].pages.workspace;

  return {
    title: workspaceMessages.title,
    description: workspaceMessages.subtitle,
  };
};

const WorkspaceLayoutContent = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { dehydratedState, displayName, referenceTimeIso } =
    await loadWorkspaceRouteData();

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkspacePageRouteProvider
        referenceTimeIso={referenceTimeIso}
        displayName={displayName}
      >
        {children}
      </WorkspacePageRouteProvider>
    </HydrationBoundary>
  );
};

const WorkspaceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Suspense fallback={<WorkspaceLoadingContent />}>
      <WorkspaceLayoutContent>{children}</WorkspaceLayoutContent>
    </Suspense>
  );
};

export default WorkspaceLayout;

"use client";

import { Suspense, use } from "react";

import Loader from "@/shared/design-system/Loader";
import BoardPageContent from "@/domains/project-management/presentation/pages/board";

const BoardPageRouteContent = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return <BoardPageContent projectId={projectId} />;
};

const BoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  return (
    <Suspense fallback={<Loader />}>
      <BoardPageRouteContent params={params} />
    </Suspense>
  );
};

export default BoardPage;

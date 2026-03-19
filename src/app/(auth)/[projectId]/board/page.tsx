"use client";

import { Suspense, use } from "react";

import Loader from "@/shared/design-system/loader";

import BoardPageContent from "@/modules/board/presentation/pages/board";

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

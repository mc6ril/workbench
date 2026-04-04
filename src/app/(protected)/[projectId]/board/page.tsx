import { Suspense } from "react";

import Loader from "@/shared/design-system/loader";

import BoardPageContent from "@/modules/board/presentation/pages/board";

const BoardPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<Loader />}>
      <BoardPageContent projectId={projectId} />
    </Suspense>
  );
};

export default BoardPage;

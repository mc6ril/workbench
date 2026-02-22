"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const BoardLayout = dynamic(() => import("@/presentation/pages/board"), {
  ssr: false,
});

const BoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return <BoardLayout projectId={projectId} />;
};

export default BoardPage;

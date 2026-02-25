"use client";

import { use } from "react";

import BoardPageContent from "@/presentation/pages/board";

const BoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return <BoardPageContent projectId={projectId} />;
};

export default BoardPage;

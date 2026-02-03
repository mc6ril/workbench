"use client";

import { use } from "react";

import BoardLayout from "@/presentation/pages/board";

const BoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return <BoardLayout projectId={projectId} />;
};

export default BoardPage;

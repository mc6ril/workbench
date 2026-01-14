"use client";

import { use } from "react";

import { Title } from "@/presentation/components/ui";

const BoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return (
    <div>
      <Title variant="h1">Board View</Title>
      <p>Project ID: {projectId}</p>
    </div>
  );
};

export default BoardPage;

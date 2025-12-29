"use client";

import { use } from "react";

export default function BoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <div>
      <h1>Board View</h1>
      <p>Project ID: {projectId}</p>
    </div>
  );
}


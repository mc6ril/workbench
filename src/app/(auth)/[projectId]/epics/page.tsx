"use client";

import { use } from "react";

export default function EpicsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <div>
      <h1>Epics View</h1>
      <p>Project ID: {projectId}</p>
    </div>
  );
}


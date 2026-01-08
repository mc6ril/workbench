"use client";

import { use } from "react";

const BacklogPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);

  return (
    <div>
      <h1>Backlog View</h1>
      <p>Project ID: {projectId}</p>
    </div>
  );
};

export default BacklogPage;

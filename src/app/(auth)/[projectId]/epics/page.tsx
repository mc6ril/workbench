"use client";

import { use } from "react";
import React from "react";

import EpicsLayout from "@/presentation/pages/epics";

const EpicsPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = use(params);

  return <EpicsLayout projectId={projectId} />;
};

export default EpicsPage;

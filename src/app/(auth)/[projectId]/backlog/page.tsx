"use client";

import { use } from "react";

import Title from "@/presentation/components/ui/Title";

import { useTranslation } from "@/shared/i18n";

const BacklogPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);
  const t = useTranslation("pages.backlog");

  return (
    <div>
      <Title variant="h1">{t("title")}</Title>
      <p>{projectId}</p>
    </div>
  );
};

export default BacklogPage;

"use client";

import { useCallback } from "react";

import RecipeDetailToolbarMenu from "./RecipeDetailToolbarMenu";

import {
  useRegisterToolbarActions,
  useRegisterToolbarBreadcrumb,
} from "@/domains/project/presentation/contexts/ToolbarBreadcrumb";

type Props = {
  title: string;
  editHref: string;
  editLabel: string;
  editAriaLabel: string;
};

const RecipeDetailToolbarClient = ({
  title,
  editHref,
  editLabel,
  editAriaLabel,
}: Props) => {
  useRegisterToolbarBreadcrumb(title);

  const renderEditAction = useCallback(
    () => (
      <RecipeDetailToolbarMenu
        editHref={editHref}
        editLabel={editLabel}
        editAriaLabel={editAriaLabel}
      />
    ),
    [editHref, editLabel, editAriaLabel]
  );
  useRegisterToolbarActions(renderEditAction);

  return null;
};

export default RecipeDetailToolbarClient;

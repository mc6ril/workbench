"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadRecipeCover } from "@/modules/recipes/core/usecases/editor/uploadRecipeCover";
import { editorCoverStorage } from "@/modules/recipes/infrastructure/supabase/repositories";

export const useUploadRecipeCover = () => {
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      uploadRecipeCover({
        editorCoverStorage,
      })({
        projectId,
        file,
      }),
  });
};

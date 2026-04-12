import type { EditorCoverStorage } from "@/modules/recipes/core/ports/editor/editorCoverStorage";

type Dependencies = {
  editorCoverStorage: EditorCoverStorage;
};

export const uploadRecipeCover =
  ({ editorCoverStorage }: Dependencies) =>
  (input: { projectId: string; file: File }) => {
    return editorCoverStorage.uploadRecipeCover(input);
  };

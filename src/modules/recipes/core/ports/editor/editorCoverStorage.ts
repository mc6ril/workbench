export type UploadRecipeCoverInput = {
  projectId: string;
  file: File;
};

export type EditorCoverStorage = {
  uploadRecipeCover(input: UploadRecipeCoverInput): Promise<string>;
};

import type { SupabaseClient } from "@supabase/supabase-js";

import { APP_LIMITS } from "@/shared/constants/app";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { prepareRecipeCoverUploadFile } from "./RecipeCoverUploadTransform.browser";

import { requireCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import type {
  EditorCoverStorage,
  UploadRecipeCoverInput,
} from "@/modules/recipes/core/ports/editor/editorCoverStorage";

const createRecipeCoverObjectKey = (projectId: string) => {
  const randomSegment =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return `${projectId}/${Date.now()}-${randomSegment}.webp`;
};

export const createEditorCoverStorage = (
  client: SupabaseClient
): EditorCoverStorage => ({
  async uploadRecipeCover({
    projectId,
    file,
  }: UploadRecipeCoverInput): Promise<string> {
    const identity = await requireCurrentAuthIdentity(client);

    const preparedFile = await prepareRecipeCoverUploadFile(file);
    const objectKey = createRecipeCoverObjectKey(projectId);
    const filePath = `${identity.userId}/${objectKey}`;

    const { error: uploadError } = await client.storage
      .from(APP_LIMITS.RECIPE_COVER.STORAGE_BUCKET)
      .upload(filePath, preparedFile, {
        upsert: false,
        contentType: preparedFile.type,
      });

    if (uploadError) {
      return handleRepositoryError(uploadError, "RecipeCover", filePath);
    }

    const {
      data: { publicUrl },
    } = client.storage
      .from(APP_LIMITS.RECIPE_COVER.STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return `${publicUrl}?v=${Date.now()}`;
  },
});

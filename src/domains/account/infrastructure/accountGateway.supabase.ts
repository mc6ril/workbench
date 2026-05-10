import { APP_LIMITS } from "@/shared/constants/app";
import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import type { UserPreferences } from "@/shared/user/userPreferences";

import { prepareAvatarUploadFile } from "./avatarUploadTransform.browser";

import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";

export const createAccountGateway = (
  client: AppSupabaseClient
): AccountGateway => ({
  async updateProfile(
    userId: string,
    input: { displayName?: string }
  ): Promise<void> {
    const { error } = await client.rpc("update_user_profile", {
      new_display_name: input.displayName,
    });

    if (error) {
      return handleRepositoryError(error, "UserProfile", userId);
    }

    await client.auth.updateUser({
      data: { display_name: input.displayName ?? null },
    });
  },

  async updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    const { error } = await client.rpc("update_user_profile", {
      new_preferences: preferences,
    });

    if (error) {
      return handleRepositoryError(error, "UserProfile", userId);
    }
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (file.size > APP_LIMITS.AVATAR.MAX_INPUT_SIZE_BYTES) {
      throw createAppError(INFRA_ERROR_CODE.AVATAR_FILE_TOO_LARGE, {
        debugMessage: "Avatar file is too large to process",
      });
    }

    if (
      !APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES.includes(
        file.type as (typeof APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES)[number]
      )
    ) {
      throw createAppError(INFRA_ERROR_CODE.AVATAR_INVALID_MIME_TYPE, {
        debugMessage: "Avatar must be a JPEG, PNG, or WebP image",
      });
    }

    const { data: existingFiles, error: listError } = await client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .list(userId);

    if (listError) {
      return handleRepositoryError(listError, "Avatar", userId);
    }

    const preparedFile = await prepareAvatarUploadFile(file);
    const filePath = `${userId}/avatar.webp`;

    const { error: uploadError } = await client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .upload(filePath, preparedFile, {
        upsert: true,
        contentType: preparedFile.type,
      });

    if (uploadError) {
      return handleRepositoryError(uploadError, "Avatar", userId);
    }

    const {
      data: { publicUrl },
    } = client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .getPublicUrl(filePath);
    const versionedPublicUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await client.rpc("update_avatar_url", {
      new_avatar_url: versionedPublicUrl,
    });

    if (updateError) {
      return handleRepositoryError(updateError, "UserProfile", userId);
    }

    await client.auth.updateUser({ data: { avatar_url: versionedPublicUrl } });

    const legacyFilePaths = (existingFiles ?? [])
      .map((existingFile) => `${userId}/${existingFile.name}`)
      .filter((existingFilePath) => existingFilePath !== filePath);

    if (legacyFilePaths.length > 0) {
      const { error: cleanupError } = await client.storage
        .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
        .remove(legacyFilePaths);

      // Keep the successful upload visible even if legacy objects couldn't be cleaned up.
      if (cleanupError) {
        console.warn("Failed to cleanup legacy avatar files", {
          userId,
          error: cleanupError,
        });
      }
    }

    return versionedPublicUrl;
  },

  async deleteAvatar(userId: string): Promise<void> {
    const { data: files, error: listError } = await client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .list(userId);

    if (listError) {
      return handleRepositoryError(listError, "Avatar", userId);
    }

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${f.name}`);
      const { error: deleteError } = await client.storage
        .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
        .remove(filePaths);

      if (deleteError) {
        return handleRepositoryError(deleteError, "Avatar", userId);
      }
    }

    const { error: updateError } = await client.rpc("update_avatar_url", {
      new_avatar_url: null as unknown as string,
    });

    if (updateError) {
      return handleRepositoryError(updateError, "UserProfile", userId);
    }

    await client.auth.updateUser({
      data: { avatar_url: null as unknown as string },
    });
  },

  async updateEmail(email: string): Promise<void> {
    const { error } = await client.auth.updateUser({ email });
    if (error) throw error;
  },
});

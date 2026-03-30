import type { SupabaseClient } from "@supabase/supabase-js";

import { APP_LIMITS } from "@/shared/constants/app";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { prepareAvatarUploadFile } from "./avatarUploadTransform.browser";
import { mapUserProfileRowToDomain } from "./UserProfileMapper.supabase";

import type {
  UserPreferences,
  UserProfile,
} from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";
import type { UserProfileRow } from "@/domains/profile/infrastructure/types";

/**
 * Create a Supabase-backed profile gateway using the provided client.
 *
 * @param client - Supabase client instance to use
 * @returns ProfileGateway implementation
 */
export const createProfileGateway = (
  client: SupabaseClient
): ProfileGateway => ({
  async getById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await client
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return handleRepositoryError(error, "UserProfile", userId);
    }

    if (!data) {
      return null;
    }

    return mapUserProfileRowToDomain(data as UserProfileRow);
  },

  async updateProfile(
    userId: string,
    input: { displayName?: string }
  ): Promise<void> {
    const { error } = await client.rpc("update_user_profile", {
      new_display_name: input.displayName ?? null,
    });

    if (error) {
      return handleRepositoryError(error, "UserProfile", userId);
    }
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
      throw new Error("Avatar file is too large to process");
    }

    if (
      !APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES.includes(
        file.type as (typeof APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES)[number]
      )
    ) {
      throw new Error("Avatar must be a JPEG, PNG, or WebP image");
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

    const legacyFilePaths = (existingFiles ?? [])
      .map((existingFile) => `${userId}/${existingFile.name}`)
      .filter((existingFilePath) => existingFilePath !== filePath);

    if (legacyFilePaths.length > 0) {
      const { error: cleanupError } = await client.storage
        .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
        .remove(legacyFilePaths);

      // Keep the successful upload visible to the user even if old legacy
      // objects could not be cleaned up immediately.
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
    // List files in the user's avatar folder to find the current avatar
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
      new_avatar_url: null,
    });

    if (updateError) {
      return handleRepositoryError(updateError, "UserProfile", userId);
    }
  },
});

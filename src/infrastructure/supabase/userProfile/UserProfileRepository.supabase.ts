import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserPreferences } from "@/domains/project-management/core/domain/schema/auth.schema";
import type {
  UpdateProfileInput,
  UserProfile,
} from "@/domains/project-management/core/domain/schema/userProfile.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { UserProfileRow } from "@/infrastructure/supabase/types";

import { APP_LIMITS } from "@/shared/constants/app";

import {
  mapUserProfileRowsToDomain,
  mapUserProfileRowToDomain,
} from "./UserProfileMapper.supabase";

import type { UserProfileRepository } from "@/domains/project-management/core/ports/userProfileRepository";

/**
 * Extracts the file extension from a MIME type.
 */
const getExtensionFromMime = (mimeType: string): string => {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "jpg";
};

/**
 * Create a UserProfileRepository implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns UserProfileRepository implementation
 */
export const createUserProfileRepository = (
  client: SupabaseClient
): UserProfileRepository => ({
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

  async getByIds(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { data, error } = await client
      .from("user_profiles")
      .select("*")
      .in("id", userIds);

    if (error) {
      return handleRepositoryError(error, "UserProfile");
    }

    return mapUserProfileRowsToDomain((data ?? []) as UserProfileRow[]);
  },

  async getByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await client
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return handleRepositoryError(error, "UserProfile");
    }

    if (!data) {
      return null;
    }

    return mapUserProfileRowToDomain(data as UserProfileRow);
  },

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
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
    if (file.size > APP_LIMITS.AVATAR.MAX_SIZE_BYTES) {
      throw new Error("Avatar file size must not exceed 2MB");
    }

    if (
      !APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES.includes(
        file.type as (typeof APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES)[number]
      )
    ) {
      throw new Error("Avatar must be a JPEG, PNG, or WebP image");
    }

    const ext = getExtensionFromMime(file.type);
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return handleRepositoryError(uploadError, "Avatar", userId);
    }

    const {
      data: { publicUrl },
    } = client.storage
      .from(APP_LIMITS.AVATAR.STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const { error: updateError } = await client.rpc("update_avatar_url", {
      new_avatar_url: publicUrl,
    });

    if (updateError) {
      return handleRepositoryError(updateError, "UserProfile", userId);
    }

    return publicUrl;
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

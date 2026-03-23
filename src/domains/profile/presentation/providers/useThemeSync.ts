"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import {
  resolveThemePreference,
} from "@/domains/profile/core/domain/profilePreferences.schema";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";

/**
 * Syncs the user's persisted theme preference from the profile
 * into next-themes on mount and whenever the preference changes.
 * Should be mounted once at the app root (e.g. in AppProvider).
 */
export const useThemeSync = (): void => {
  const { data: profile } = useMyProfile();
  const { setTheme } = useTheme();

  const profileTheme = profile?.preferences?.theme;

  useEffect(() => {
    if (!profileTheme) {
      return;
    }

    setTheme(resolveThemePreference(profileTheme));
  }, [profileTheme, setTheme]);
};

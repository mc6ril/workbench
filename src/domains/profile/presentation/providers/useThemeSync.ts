"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import {
  type Theme,
  ThemeValues,
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

    const isValid = (ThemeValues as readonly string[]).includes(profileTheme);
    const nextTheme: Theme = isValid ? (profileTheme as Theme) : "system";

    setTheme(nextTheme);
  }, [profileTheme, setTheme]);
};

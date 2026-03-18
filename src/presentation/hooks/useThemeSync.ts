"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import type { Theme } from "@/domains/project-management/core/domain/schema/auth.schema";
import { ThemeValues } from "@/domains/project-management/core/domain/schema/auth.schema";

import { useSession } from "@/presentation/hooks/auth/useSession";

/**
 * Syncs the user's persisted theme preference (from Supabase session)
 * into next-themes on mount and whenever the preference changes.
 * Should be mounted once at the app root (e.g. in AppProvider).
 */
export const useThemeSync = (): void => {
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  const sessionTheme = session?.preferences?.theme;

  useEffect(() => {
    if (!sessionTheme) {
      return;
    }

    const isValid = (ThemeValues as readonly string[]).includes(sessionTheme);
    const nextTheme: Theme = isValid ? (sessionTheme as Theme) : "system";

    setTheme(nextTheme);
  }, [sessionTheme, setTheme]);
};

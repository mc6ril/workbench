import { z } from "zod";

import { UserProfileSchema } from "@/domains/profile/core/domain/profile.types";
import { CurrentSessionSchema } from "@/domains/session/core/domain/currentSession.schema";

/**
 * Read-model for the current authenticated user.
 * It composes session identity data with reusable profile data, without
 * exposing low-level auth tokens.
 */
export const CurrentViewerSchema = CurrentSessionSchema.pick({
  userId: true,
  loginEmail: true,
  isSuperuser: true,
}).extend({
  displayName: UserProfileSchema.shape.displayName,
  avatarUrl: UserProfileSchema.shape.avatarUrl,
  preferences: UserProfileSchema.shape.preferences,
});

export type CurrentViewer = z.infer<typeof CurrentViewerSchema>;

import { z } from "zod";

/**
 * Current authenticated identity state.
 * This contains session claims only, not profile data.
 */
export const CurrentSessionSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  accessToken: z.string(),
  isSuperuser: z.boolean(),
});

export type CurrentSession = z.infer<typeof CurrentSessionSchema>;

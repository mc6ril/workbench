/**
 * Current authenticated identity state.
 * This contains session claims only, not profile data.
 */
export type CurrentSession = {
  userId: string;
  loginEmail: string;
  accessToken: string;
  isSuperuser: boolean;
};

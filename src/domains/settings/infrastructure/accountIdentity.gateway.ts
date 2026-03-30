import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import type { AccountIdentityGateway } from "@/domains/settings/core/ports/accountIdentity.gateway";

export const accountIdentityGateway: AccountIdentityGateway = {
  async updateDisplayName(userId, displayName) {
    await profileGateway.updateProfile(userId, { displayName });
  },

  async updateEmail(email) {
    await authGateway.updateCredentials({ email });
  },
};

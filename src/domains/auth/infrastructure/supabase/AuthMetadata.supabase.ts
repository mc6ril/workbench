import type { UserAppMetadata, UserMetadata } from "@supabase/supabase-js";

import type { Locale } from "@/shared/i18n/config";
import { isRecord, isString } from "@/shared/utils";

export const EMAIL_AUTH_PROVIDER = "email";

export type AuthAppMetadata = {
  provider?: unknown;
  providers?: unknown;
  is_superuser?: unknown;
  [key: string]: unknown;
};

export type AuthUserMetadata = {
  email?: unknown;
  locale?: unknown;
  display_name?: unknown;
  terms_accepted_at?: unknown;
  [key: string]: unknown;
};

export type SignUpAuthUserMetadata = {
  locale: Locale;
  display_name?: string;
  terms_accepted_at?: string;
};

export const asAuthAppMetadata = (
  metadata: UserAppMetadata | AuthAppMetadata | null | undefined
): AuthAppMetadata | undefined => {
  return isRecord(metadata) ? metadata : undefined;
};

export const asAuthUserMetadata = (
  metadata: UserMetadata | AuthUserMetadata | null | undefined
): AuthUserMetadata | undefined => {
  return isRecord(metadata) ? metadata : undefined;
};

export const getAuthUserMetadataEmail = (
  metadata: UserMetadata | null | undefined
): string | null => {
  const authUserMetadata = asAuthUserMetadata(metadata);
  const email = authUserMetadata?.email;

  return isString(email) && email.length > 0 ? email : null;
};

export const buildSignUpAuthUserMetadata = ({
  displayName,
  locale,
  termsAcceptedAt,
}: {
  displayName?: string;
  locale: Locale;
  termsAcceptedAt?: string;
}): SignUpAuthUserMetadata => {
  return {
    locale,
    ...(displayName ? { display_name: displayName } : {}),
    ...(termsAcceptedAt ? { terms_accepted_at: termsAcceptedAt } : {}),
  };
};

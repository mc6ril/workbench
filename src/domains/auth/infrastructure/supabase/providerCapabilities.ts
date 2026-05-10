import {
  asAuthAppMetadata,
  type AuthAppMetadata,
  EMAIL_AUTH_PROVIDER,
} from "@/domains/auth/infrastructure/supabase/AuthMetadata.supabase";

/**
 * Extracts Supabase auth providers from app_metadata.
 * Supabase may expose either `provider` or `providers`.
 */
export const extractAuthProviders = (
  appMetadata: AuthAppMetadata | null | undefined
): string[] => {
  const metadata = asAuthAppMetadata(appMetadata);
  const providers = metadata?.providers;

  if (Array.isArray(providers)) {
    return providers.filter(
      (provider): provider is string =>
        typeof provider === "string" && provider.length > 0
    );
  }

  const provider = metadata?.provider;

  if (typeof provider === "string" && provider.length > 0) {
    return [provider];
  }

  return [];
};

/**
 * Password updates stay available whenever the email provider is linked.
 * If Supabase exposes no provider metadata, default to `true`.
 */
export const canUpdatePasswordFromAppMetadata = (
  appMetadata: AuthAppMetadata | null | undefined
): boolean => {
  const providers = extractAuthProviders(appMetadata);

  if (providers.length === 0) {
    return true;
  }

  return providers.includes(EMAIL_AUTH_PROVIDER);
};

export const isSuperuserFromAppMetadata = (
  appMetadata: AuthAppMetadata | null | undefined
): boolean => {
  const metadata = asAuthAppMetadata(appMetadata);
  return metadata?.is_superuser === true;
};

const EMAIL_PROVIDER = "email";

/**
 * Extracts Supabase auth providers from app_metadata.
 * Supabase may expose either `provider` or `providers`.
 */
export const extractAuthProviders = (
  appMetadata: Record<string, unknown> | undefined
): string[] => {
  const providers = appMetadata?.providers;

  if (Array.isArray(providers)) {
    return providers.filter(
      (provider): provider is string =>
        typeof provider === "string" && provider.length > 0
    );
  }

  const provider = appMetadata?.provider;

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
  appMetadata: Record<string, unknown> | undefined
): boolean => {
  const providers = extractAuthProviders(appMetadata);

  if (providers.length === 0) {
    return true;
  }

  return providers.includes(EMAIL_PROVIDER);
};

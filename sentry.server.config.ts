/**
 * Sentry Node.js server runtime configuration.
 */

import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: false,

  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  includeLocalVariables: true,

  enableLogs: true,
});

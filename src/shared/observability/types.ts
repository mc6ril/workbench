/**
 * Internal types for structured logging implementation.
 */

import type { LogError, LogLevel, LogMeta } from "@/core/ports/logger";

/**
 * Structured log format for JSON output.
 */
export type StructuredLog = {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta: LogMeta;
  error?: LogError;
  traceId?: string;
};

/**
 * Log configuration.
 */
export type LogConfig = {
  level: LogLevel;
  enableConsole: boolean;
};

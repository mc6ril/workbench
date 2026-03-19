/**
 * Public exports for observability system.
 */

export { createLoggerFactory } from "./loggerFactory";
export {
  createInstrumentedSupabaseFetch,
  getNavigationPerfSnapshot,
  isNavigationPerfEnabled,
  markNavigationSettled,
  markNavigationStart,
  recordFullPageLoaderShown,
  resetNavigationPerfMetrics,
} from "./navigationPerf";
export type {
  LogError,
  Logger,
  LoggerFactory,
  LogLevel,
  LogMeta,
} from "@/shared/observability/logger.port";

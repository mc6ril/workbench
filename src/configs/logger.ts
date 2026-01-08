/**
 * Composition root for logger factory.
 * Provides singleton loggerFactory instance for dependency injection.
 *
 * Usecases should receive loggerFactory as a parameter, not import this directly.
 */

import { createLoggerFactory } from "@/shared/observability/loggerFactory";

/**
 * Singleton logger factory instance.
 * Use this for dependency injection in usecases and other components.
 */
export const loggerFactory = createLoggerFactory();

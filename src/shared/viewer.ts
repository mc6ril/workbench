/**
 * Bridge export for current viewer access across domains.
 *
 * Viewer is a read-model that composes session + profile for UI consumers,
 * without leaking auth tokens or mutation concerns.
 */
export { useViewer } from "@/domains/viewer/presentation/hooks";

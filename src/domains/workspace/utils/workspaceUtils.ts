/**
 * Workspace-related utility functions.
 */

/**
 * Available workspace emojis for visual identification.
 */
const WORKSPACE_EMOJIS = [
  "🎨",
  "🛍️",
  "📸",
  "✨",
  "🌸",
  "💡",
  "📝",
  "🎯",
] as const;

/**
 * Returns an emoji for a workspace based on its index.
 * Cycles through a predefined list of emojis.
 *
 * @param index - The index of the workspace in the list
 * @returns An emoji string for visual identification
 *
 * @example
 * ```tsx
 * getWorkspaceEmoji(0); // "🎨"
 * getWorkspaceEmoji(3); // "✨"
 * getWorkspaceEmoji(8); // "🎨" (cycles back)
 * ```
 */
export const getWorkspaceEmoji = (index: number): string => {
  return WORKSPACE_EMOJIS[index % WORKSPACE_EMOJIS.length];
};

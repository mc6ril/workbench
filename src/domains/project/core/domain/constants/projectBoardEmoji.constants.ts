import { PROJECT_BOARD_EMOJI_PRESETS } from "@/shared/constants/projectBoardEmoji";

/**
 * Preset emojis allowed for the project board icon (stored separately from name and short code).
 */
export type ProjectBoardEmojiPreset = (typeof PROJECT_BOARD_EMOJI_PRESETS)[number];

const PRESET_SET = new Set<string>(PROJECT_BOARD_EMOJI_PRESETS);

export const isAllowedProjectBoardEmoji = (value: string): boolean => {
  return PRESET_SET.has(value);
};

/**
 * Returns true if the string contains at least one pictographic emoji.
 * Used to keep project names and short codes free of emoji (emoji lives in board_emoji).
 */
export const containsEmoji = (value: string): boolean => {
  return /\p{Extended_Pictographic}/u.test(value);
};

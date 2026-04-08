/**
 *
 * @param lastUpdateContent - The date to format
 * @returns The formatted date
 */
export const getLastUpdateContent = (
  lastUpdateContent: Date | undefined,
  referenceDate: Date = new Date()
): { hours: number; days: number } => {
  if (!lastUpdateContent) {
    return { hours: 0, days: 0 };
  }
  // show difference in hours, days, weeks
  // show hours if less than a day
  // show days if less than a week
  // else show date
  const diff = Math.max(
    0,
    referenceDate.getTime() - lastUpdateContent.getTime()
  );
  const diffHours = diff / (1000 * 60 * 60);
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return { hours: Math.floor(diffHours), days: Math.floor(diffDays) };
};

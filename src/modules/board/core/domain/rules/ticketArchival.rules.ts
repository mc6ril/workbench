/**
 * Weekly archival rule:
 * - timezone: Europe/Paris
 * - week boundary: Monday 00:00 local time (ISO week)
 * - scheduling: run hourly and archive tickets completed before the current
 *   local week boundary, while they are still in a done column.
 *
 * Running hourly keeps the mechanism resilient to DST changes and transient
 * scheduler failures while preserving a weekly archival effect.
 */
export const WEEKLY_TICKET_ARCHIVE_TIME_ZONE = "Europe/Paris";
export const WEEKLY_TICKET_ARCHIVE_CRON_SCHEDULE = "5 * * * *";

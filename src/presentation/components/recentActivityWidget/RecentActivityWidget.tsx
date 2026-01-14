import React from "react";

import { Badge, Card, EmptyState,Text } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./RecentActivityWidget.module.scss";

type Activity = {
  id: string;
  type: "ticket_created" | "ticket_updated" | "ticket_completed" | string;
  title: string;
  timestamp: Date | string;
  projectId?: string;
  ticketId?: string;
};

type Props = {
  activities: Activity[];
  onActivityClick?: (
    activityId: string,
    projectId?: string,
    ticketId?: string
  ) => void;
  emptyMessage?: string;
  className?: string;
};

const RecentActivityWidget = ({
  activities,
  onActivityClick,
  emptyMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.home.recentActivityWidget");
  const widgetId = getAccessibilityId("recent-activity-widget");
  const displayEmptyMessage = emptyMessage || t("emptyMessage");

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActivityTypeLabel = (type: string): string => {
    return t(`types.${type}`) || type;
  };

  const handleActivityClick = (
    activityId: string,
    projectId?: string,
    ticketId?: string
  ): void => {
    if (onActivityClick) {
      onActivityClick(activityId, projectId, ticketId);
    }
  };

  const widgetClasses = [styles["recent-activity-widget"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      title={t("title")}
      className={widgetClasses}
      ariaLabel={t("title")}
    >
      {activities.length === 0 ? (
        <EmptyState
          title={displayEmptyMessage}
          ariaLabel={displayEmptyMessage}
        />
      ) : (
        <ul
          id={widgetId}
          className={styles["recent-activity-widget__list"]}
          aria-label={t("title")}
          role="log"
          aria-live="polite"
        >
          {activities.map((activity) => {
            const activityAriaLabel = `${getActivityTypeLabel(activity.type)}: ${activity.title}, ${formatTimestamp(activity.timestamp)}`;

            return (
              <li
                key={activity.id}
                className={styles["recent-activity-widget__item"]}
              >
                {onActivityClick ? (
                  <button
                    type="button"
                    className={styles["recent-activity-widget__activity"]}
                    onClick={() => {
                      handleActivityClick(
                        activity.id,
                        activity.projectId,
                        activity.ticketId
                      );
                    }}
                    aria-label={`${t("activityAriaLabel")}: ${activityAriaLabel}`}
                  >
                    <div
                      className={
                        styles["recent-activity-widget__activity-content"]
                      }
                    >
                      <div
                        className={
                          styles["recent-activity-widget__activity-header"]
                        }
                      >
                        <Badge
                          label={getActivityTypeLabel(activity.type)}
                          variant="default"
                          size="small"
                        />
                        <Text
                          variant="caption"
                          className={
                            styles["recent-activity-widget__activity-timestamp"]
                          }
                        >
                          {formatTimestamp(activity.timestamp)}
                        </Text>
                      </div>
                      <Text
                        variant="body"
                        className={
                          styles["recent-activity-widget__activity-title"]
                        }
                      >
                        {activity.title}
                      </Text>
                    </div>
                  </button>
                ) : (
                  <div className={styles["recent-activity-widget__activity"]}>
                    <div
                      className={
                        styles["recent-activity-widget__activity-content"]
                      }
                    >
                      <div
                        className={
                          styles["recent-activity-widget__activity-header"]
                        }
                      >
                        <Badge
                          label={getActivityTypeLabel(activity.type)}
                          variant="default"
                          size="small"
                        />
                        <Text
                          variant="caption"
                          className={
                            styles["recent-activity-widget__activity-timestamp"]
                          }
                        >
                          {formatTimestamp(activity.timestamp)}
                        </Text>
                      </div>
                      <Text
                        variant="body"
                        className={
                          styles["recent-activity-widget__activity-title"]
                        }
                      >
                        {activity.title}
                      </Text>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default RecentActivityWidget;
"use client";

import { useMemo } from "react";

import Link from "@/presentation/components/ui/Link";
import Text from "@/presentation/components/ui/Text";
import { useSession } from "@/presentation/hooks/auth/useSession";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import { useTicketAssigneesByProjectId } from "@/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./ProjectHomeDashboard.module.scss";

type Props = {
  projectId: string;
};

const MAX_ITEMS = 5;
const RECENT_PROGRESS_WINDOW_IN_DAYS = 14;

const ProjectHomeDashboard = ({ projectId }: Props) => {
  const t = useTranslation("pages.projectHome");
  const { data: session } = useSession();
  const { data: assigneesByTicketId = {} } =
    useTicketAssigneesByProjectId(projectId);
  const { data: boardConfiguration } = useBoardConfiguration(projectId);
  const { data: epics = [] } = useEpics(projectId);
  const { data: tickets = [] } = useTickets(
    projectId,
    undefined,
    undefined,
    "",
    {
      useProjectWideCache: true,
    }
  );

  const statusLabelByValue = useMemo(() => {
    const columns = boardConfiguration?.columns ?? [];
    return new Map(columns.map((column) => [column.status, column.name]));
  }, [boardConfiguration?.columns]);

  const myTasks = useMemo(() => {
    const userId = session?.userId;
    if (!userId) {
      return [];
    }

    return tickets
      .filter((ticket) => {
        if (ticket.parentId !== null) {
          return false;
        }
        const assignees = assigneesByTicketId[ticket.id] ?? [];
        return assignees.some((assignee) => assignee.userId === userId);
      })
      .sort(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
      )
      .slice(0, MAX_ITEMS);
  }, [assigneesByTicketId, session?.userId, tickets]);

  const recentTasks = useMemo(() => {
    return tickets
      .filter((ticket) => ticket.parentId === null)
      .sort(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
      )
      .slice(0, MAX_ITEMS);
  }, [tickets]);

  const recentlyProgressedGoals = useMemo(() => {
    const doneStatuses = new Set(
      (boardConfiguration?.columns ?? [])
        .filter((column) => column.state === "done")
        .map((column) => column.status)
    );
    const doneStatusFallback =
      doneStatuses.size > 0 ? doneStatuses : new Set(["done"]);
    const windowMs = RECENT_PROGRESS_WINDOW_IN_DAYS * 24 * 60 * 60 * 1000;
    const epicById = new Map(epics.map((epic) => [epic.id, epic]));
    const progressionByEpicId = new Map<
      string,
      { total: number; gained: number; lastIncreaseAt: number }
    >();

    tickets.forEach((ticket) => {
      if (ticket.parentId !== null || !ticket.epicId) {
        return;
      }

      const epic = epicById.get(ticket.epicId);
      if (!epic) {
        return;
      }

      const existing = progressionByEpicId.get(ticket.epicId) ?? {
        total: 0,
        gained: 0,
        lastIncreaseAt: 0,
      };
      existing.total += 1;

      const isRecentlyMovedToDone =
        doneStatusFallback.has(ticket.status) &&
        Date.now() - ticket.updatedAt.getTime() <= windowMs;
      if (isRecentlyMovedToDone) {
        existing.gained += 1;
        existing.lastIncreaseAt = Math.max(
          existing.lastIncreaseAt,
          ticket.updatedAt.getTime()
        );
      }

      progressionByEpicId.set(ticket.epicId, existing);
    });

    const doneTicketCountByEpicId = new Map<string, number>();
    tickets.forEach((ticket) => {
      if (ticket.parentId !== null || !ticket.epicId) {
        return;
      }
      if (doneStatusFallback.has(ticket.status)) {
        doneTicketCountByEpicId.set(
          ticket.epicId,
          (doneTicketCountByEpicId.get(ticket.epicId) ?? 0) + 1
        );
      }
    });

    return Array.from(progressionByEpicId.entries())
      .map(([epicId, stats]) => {
        const epic = epicById.get(epicId);
        if (!epic || stats.total === 0) {
          return null;
        }
        const gainedPercent = Math.round((stats.gained / stats.total) * 100);
        const doneCount = doneTicketCountByEpicId.get(epicId) ?? 0;
        const currentProgress = Math.round((doneCount / stats.total) * 100);
        return {
          id: epic.id,
          name: epic.name,
          gainedPercent,
          currentProgress,
          lastIncreaseAt: stats.lastIncreaseAt,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          name: string;
          gainedPercent: number;
          currentProgress: number;
          lastIncreaseAt: number;
        } => item !== null && item.gainedPercent > 0
      )
      .sort((left, right) => right.lastIncreaseAt - left.lastIncreaseAt)
      .slice(0, MAX_ITEMS);
  }, [boardConfiguration?.columns, epics, tickets]);

  const backlogRoute = buildProjectRoute(projectId, PROJECT_VIEWS.BACKLOG);

  return (
    <section className={styles["project-home-dashboard"]}>
      <article className={styles["project-home-card"]}>
        <div className={styles["project-home-card__header"]}>
          <span
            className={styles["project-home-card__icon"]}
            aria-hidden="true"
          >
            ✅
          </span>
          <div>
            <h3 className={styles["project-home-card__title"]}>
              {t("myTasksTitle")}
            </h3>
            <Text
              variant="small"
              className={styles["project-home-card__description"]}
            >
              {t("myTasksDescription")}
            </Text>
          </div>
        </div>
        <div className={styles["project-home-card__body"]}>
          {myTasks.length === 0 ? (
            <Text variant="body">{t("myTasksEmpty")}</Text>
          ) : (
            <ul className={styles["project-home-list"]}>
              {myTasks.map((ticket) => (
                <li key={ticket.id} className={styles["project-home-item"]}>
                  <div className={styles["project-home-item__main"]}>
                    <Link
                      href={`${backlogRoute}?ticket=${ticket.id}`}
                      className={styles["project-home-item__link"]}
                    >
                      {ticket.title}
                    </Link>
                    <span className={styles["project-home-item__status"]}>
                      {statusLabelByValue.get(ticket.status) ?? ticket.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={backlogRoute}
            className={styles["project-home-card__footer-link"]}
            ariaLabel={t("openBacklogAriaLabel")}
          >
            {t("openBacklog")}
          </Link>
        </div>
      </article>

      <article className={styles["project-home-card"]}>
        <div className={styles["project-home-card__header"]}>
          <span
            className={styles["project-home-card__icon"]}
            aria-hidden="true"
          >
            🕒
          </span>
          <div>
            <h3 className={styles["project-home-card__title"]}>
              {t("recentTitle")}
            </h3>
            <Text
              variant="small"
              className={styles["project-home-card__description"]}
            >
              {t("recentDescription")}
            </Text>
          </div>
        </div>
        <div className={styles["project-home-card__body"]}>
          {recentTasks.length === 0 ? (
            <Text variant="body">{t("recentEmpty")}</Text>
          ) : (
            <ul className={styles["project-home-list"]}>
              {recentTasks.map((ticket) => (
                <li key={ticket.id} className={styles["project-home-item"]}>
                  <div className={styles["project-home-item__main"]}>
                    <Link
                      href={`${backlogRoute}?ticket=${ticket.id}`}
                      className={styles["project-home-item__link"]}
                    >
                      {ticket.title}
                    </Link>
                    <span className={styles["project-home-item__status"]}>
                      {statusLabelByValue.get(ticket.status) ?? ticket.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={backlogRoute}
            className={styles["project-home-card__footer-link"]}
            ariaLabel={t("openBacklogAriaLabel")}
          >
            {t("openBacklog")}
          </Link>
        </div>
      </article>

      <article className={styles["project-home-card"]}>
        <div className={styles["project-home-card__header"]}>
          <span
            className={styles["project-home-card__icon"]}
            aria-hidden="true"
          >
            🎯
          </span>
          <div>
            <h3 className={styles["project-home-card__title"]}>
              {t("goalProgressDeltaTitle")}
            </h3>
            <Text
              variant="small"
              className={styles["project-home-card__description"]}
            >
              {t("goalProgressDeltaDescription")}
            </Text>
          </div>
        </div>
        <div className={styles["project-home-card__body"]}>
          {recentlyProgressedGoals.length === 0 ? (
            <Text variant="body">{t("goalProgressDeltaEmpty")}</Text>
          ) : (
            <ul className={styles["project-home-goal-list"]}>
              {recentlyProgressedGoals.map((goal) => (
                <li key={goal.id} className={styles["project-home-goal-item"]}>
                  <div className={styles["project-home-goal-item__header"]}>
                    <span className={styles["project-home-goal-item__name"]}>
                      {goal.name}
                    </span>
                    <span className={styles["project-home-goal-item__delta"]}>
                      {t("goalProgressDeltaValue", {
                        progress: goal.gainedPercent,
                      })}
                    </span>
                  </div>
                  <Text
                    variant="caption"
                    className={styles["project-home-goal-item__meta"]}
                  >
                    {t("goalProgressCurrentValue", {
                      progress: goal.currentProgress,
                    })}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
};

export default ProjectHomeDashboard;

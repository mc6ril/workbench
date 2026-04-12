import styles from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import type { ProjectToolbarExtraTool } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";

type Props = {
  extraTools?: ProjectToolbarExtraTool[];
};

const buildToolClassName = (
  isActive: boolean,
  hasBadge: boolean
): string => {
  return [
    styles["project-toolbar__tool"],
    isActive ? styles["project-toolbar__tool--active"] : undefined,
    hasBadge ? styles["project-toolbar__tool--with-badge"] : undefined,
  ]
    .filter(Boolean)
    .join(" ");
};

const ProjectToolbarTools = ({ extraTools = [] }: Props) => {
  if (extraTools.length === 0) {
    return null;
  }

  return (
    <div className={styles["project-toolbar__tools"]}>
      {extraTools.map((tool) => {
        const hasBadge = (tool.badgeCount ?? 0) > 0;
        const badgeLabel = (tool.badgeCount ?? 0) > 99 ? "99+" : tool.badgeCount;

        return (
          <button
            key={tool.key}
            id={tool.domId}
            type="button"
            className={buildToolClassName(tool.isActive ?? false, hasBadge)}
            onClick={tool.onClick}
            aria-label={tool.ariaLabel}
            title={tool.label}
            aria-pressed={tool.isActive ?? false}
          >
            {tool.icon ? (
              <span className={styles["project-toolbar__tool-icon"]}>
                {tool.icon}
              </span>
            ) : null}
            <span className={styles["project-toolbar__tool-label"]}>
              {tool.label}
            </span>
            {hasBadge ? (
              <span
                key={`${tool.badgePulseKey ?? 0}-${badgeLabel}`}
                aria-hidden="true"
                className={styles["project-toolbar__tool-badge"]}
              >
                {badgeLabel}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectToolbarTools;

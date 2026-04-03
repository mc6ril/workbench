import styles from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import type { ProjectToolbarExtraTool } from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";

type Props = {
  extraTools?: ProjectToolbarExtraTool[];
};

const buildToolClassName = (isActive: boolean): string => {
  return [
    styles["project-toolbar__tool"],
    isActive ? styles["project-toolbar__tool--active"] : undefined,
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
      {extraTools.map((tool) => (
        <button
          key={tool.key}
          type="button"
          className={buildToolClassName(tool.isActive ?? false)}
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
        </button>
      ))}
    </div>
  );
};

export default ProjectToolbarTools;

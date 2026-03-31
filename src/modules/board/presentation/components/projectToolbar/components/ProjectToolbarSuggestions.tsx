import Badge from "@/shared/design-system/badge";
import { useTranslation } from "@/shared/i18n";

import styles from "@/modules/board/presentation/components/projectToolbar/ProjectToolbar.module.scss";
import type { ProjectSearchSuggestion } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";

type Props = {
  suggestionsId: string;
  searchSuggestions: ProjectSearchSuggestion[];
  activeSuggestionIndex: number;
  onSuggestionMouseEnter: (index: number) => void;
  onSuggestionMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSuggestionSelect: (href: string) => void;
};

const ProjectToolbarSuggestions = ({
  suggestionsId,
  searchSuggestions,
  activeSuggestionIndex,
  onSuggestionMouseEnter,
  onSuggestionMouseDown,
  onSuggestionSelect,
}: Props) => {
  const t = useTranslation("pages.board.search");

  return (
    <div
      id={suggestionsId}
      role="listbox"
      className={styles["project-toolbar__search-results"]}
    >
      {searchSuggestions.map((suggestion, index) => (
        <button
          id={`${suggestionsId}-option-${index}`}
          key={suggestion.id}
          type="button"
          role="option"
          aria-selected={index === activeSuggestionIndex}
          className={[
            styles["project-toolbar__search-result-item"],
            index === activeSuggestionIndex
              ? styles["project-toolbar__search-result-item--active"]
              : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => {
            onSuggestionMouseEnter(index);
          }}
          onMouseDown={onSuggestionMouseDown}
          onClick={() => {
            onSuggestionSelect(suggestion.href);
          }}
        >
          <span className={styles["project-toolbar__search-result-label"]}>
            {suggestion.label}
          </span>
          {suggestion.isArchived ? (
            <Badge
              label={t("archivedBadge")}
              variant="warning"
              size="small"
              className={`${styles["project-toolbar__search-result-badge"]} ${styles["project-toolbar__search-result-badge--warning"]}`}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default ProjectToolbarSuggestions;

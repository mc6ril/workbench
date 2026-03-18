import type { ProjectSearchSuggestion } from "@/presentation/hooks/project/useProjectSearchSuggestions";

import styles from "@/domains/project-management/presentation/components/projectToolbar/ProjectToolbar.module.scss";

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
          {suggestion.label}
        </button>
      ))}
    </div>
  );
};

export default ProjectToolbarSuggestions;

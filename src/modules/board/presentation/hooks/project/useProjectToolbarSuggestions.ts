import { useCallback, useEffect, useRef, useState } from "react";

import type { ProjectSearchSuggestion } from "@/modules/board/presentation/hooks/project/useProjectSearchSuggestions";

type UseProjectToolbarSuggestionsParams = {
  searchValue: string;
  searchSuggestions: ProjectSearchSuggestion[];
  onSearchChange?: (value: string) => void;
  onSuggestionSelect: (href: string) => void;
};

export const useProjectToolbarSuggestions = ({
  searchValue,
  searchSuggestions,
  onSearchChange,
  onSuggestionSelect,
}: UseProjectToolbarSuggestionsParams) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState<number>(-1);

  const closeSuggestions = useCallback(() => {
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      onSearchChange?.(nextValue);

      if (nextValue.trim() === "") {
        closeSuggestions();
        return;
      }

      setIsSuggestionsOpen(true);
    },
    [closeSuggestions, onSearchChange]
  );

  const openSuggestions = useCallback(() => {
    if (searchValue.trim() === "" || searchSuggestions.length === 0) {
      return;
    }
    setIsSuggestionsOpen(true);
  }, [searchSuggestions.length, searchValue]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [closeSuggestions]);

  const handleSuggestionSelect = useCallback(
    (href: string) => {
      closeSuggestions();
      onSuggestionSelect(href);
    },
    [closeSuggestions, onSuggestionSelect]
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (searchSuggestions.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        openSuggestions();
        setActiveSuggestionIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        openSuggestions();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        return;
      }

      if (event.key === "Escape") {
        closeSuggestions();
        return;
      }

      if (event.key === "Enter" && activeSuggestionIndex >= 0) {
        event.preventDefault();
        const suggestion = searchSuggestions[activeSuggestionIndex];
        if (suggestion) {
          handleSuggestionSelect(suggestion.href);
        }
      }
    },
    [
      activeSuggestionIndex,
      closeSuggestions,
      handleSuggestionSelect,
      openSuggestions,
      searchSuggestions,
    ]
  );

  const handleSuggestionMouseEnter = useCallback((index: number) => {
    setActiveSuggestionIndex(index);
  }, []);

  const handleSuggestionMouseDown = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    },
    []
  );

  const showSuggestions =
    isSuggestionsOpen &&
    searchValue.trim() !== "" &&
    searchSuggestions.length > 0;

  return {
    searchContainerRef,
    showSuggestions,
    activeSuggestionIndex,
    handleSearchChange,
    handleSearchKeyDown,
    openSuggestions,
    handleSuggestionMouseEnter,
    handleSuggestionMouseDown,
    handleSuggestionSelect,
  };
};

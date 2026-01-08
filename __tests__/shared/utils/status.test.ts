import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import {
  getQueryStatus,
  isMutationError,
  isMutationPending,
  isQueryEmpty,
  isQueryError,
  isQueryLoading,
  shouldShowEmpty,
  shouldShowError,
  shouldShowLoading,
} from "@/shared/utils/status";

describe("status utilities", () => {
  describe("isQueryLoading", () => {
    it("should return true when query is loading", () => {
      // Arrange
      const queryResult = {
        isLoading: true,
        isFetching: false,
        data: undefined,
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryLoading(queryResult)).toBe(true);
    });

    it("should return false when query is not loading", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: "test",
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryLoading(queryResult)).toBe(false);
    });
  });

  describe("isQueryError", () => {
    it("should return true when query has error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: undefined,
        error: { code: "TEST_ERROR" },
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryError(queryResult)).toBe(true);
    });

    it("should return false when query has no error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: "test",
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryError(queryResult)).toBe(false);
    });

    it("should return false when error is undefined", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: "test",
        error: undefined,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryError(queryResult)).toBe(false);
    });
  });

  describe("isQueryEmpty", () => {
    it("should return true when data is null", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: null,
        error: null,
      } as unknown as UseQueryResult<string | null, unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(true);
    });

    it("should return true when data is undefined", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: undefined,
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(true);
    });

    it("should return true when data is empty array", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: [],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(true);
    });

    it("should return false when data is non-empty array", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: ["item1", "item2"],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(false);
    });

    it("should return false when there is an error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: null,
        error: { code: "TEST_ERROR" },
      } as unknown as UseQueryResult<string | null, unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(false);
    });

    it("should return false when data is non-empty object", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: { key: "value" },
        error: null,
      } as unknown as UseQueryResult<{ key: string }, unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(false);
    });

    it("should return true when data is empty object", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: {},
        error: null,
      } as unknown as UseQueryResult<Record<string, never>, unknown>;

      // Act & Assert
      expect(isQueryEmpty(queryResult)).toBe(true);
    });
  });

  describe("isMutationPending", () => {
    it("should return true when mutation is pending", () => {
      // Arrange
      const mutationResult = {
        isPending: true,
        data: undefined,
        error: null,
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act & Assert
      expect(isMutationPending(mutationResult)).toBe(true);
    });

    it("should return false when mutation is not pending", () => {
      // Arrange
      const mutationResult = {
        isPending: false,
        data: "result",
        error: null,
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act & Assert
      expect(isMutationPending(mutationResult)).toBe(false);
    });
  });

  describe("isMutationError", () => {
    it("should return true when mutation has error", () => {
      // Arrange
      const mutationResult = {
        isPending: false,
        data: undefined,
        error: { code: "TEST_ERROR" },
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act & Assert
      expect(isMutationError(mutationResult)).toBe(true);
    });

    it("should return false when mutation has no error", () => {
      // Arrange
      const mutationResult = {
        isPending: false,
        data: "result",
        error: null,
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act & Assert
      expect(isMutationError(mutationResult)).toBe(false);
    });
  });

  describe("getQueryStatus", () => {
    it("should return correct status for loading query", () => {
      // Arrange
      const queryResult = {
        isLoading: true,
        isFetching: false,
        data: undefined,
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act
      const status = getQueryStatus(queryResult);

      // Assert
      expect(status.isLoading).toBe(true);
      expect(status.isFetching).toBe(false);
      expect(status.isPending).toBe(false);
      expect(status.hasError).toBe(false);
      expect(status.isEmpty).toBe(true);
      expect(status.isAnyLoading).toBe(true);
    });

    it("should return correct status for query with error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: undefined,
        error: { code: "TEST_ERROR" },
      } as unknown as UseQueryResult<string, unknown>;

      // Act
      const status = getQueryStatus(queryResult);

      // Assert
      expect(status.isLoading).toBe(false);
      expect(status.hasError).toBe(true);
      expect(status.isEmpty).toBe(false);
      expect(status.isAnyLoading).toBe(false);
    });

    it("should return correct status for empty query data", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: [],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act
      const status = getQueryStatus(queryResult);

      // Assert
      expect(status.isLoading).toBe(false);
      expect(status.hasError).toBe(false);
      expect(status.isEmpty).toBe(true);
      expect(status.isAnyLoading).toBe(false);
    });

    it("should return correct status for pending mutation", () => {
      // Arrange
      const mutationResult = {
        isPending: true,
        data: undefined,
        error: null,
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act
      const status = getQueryStatus(mutationResult);

      // Assert
      expect(status.isLoading).toBe(false);
      expect(status.isFetching).toBe(false);
      expect(status.isPending).toBe(true);
      expect(status.hasError).toBe(false);
      expect(status.isAnyLoading).toBe(true);
    });

    it("should handle plain object with status properties", () => {
      // Arrange
      const plainResult = {
        isLoading: true,
        isFetching: false,
        isPending: false,
        data: undefined,
        error: null,
      };

      // Act
      const status = getQueryStatus(plainResult);

      // Assert
      expect(status.isLoading).toBe(true);
      expect(status.isAnyLoading).toBe(true);
    });
  });

  describe("shouldShowLoading", () => {
    it("should return true when query is loading", () => {
      // Arrange
      const queryResult = {
        isLoading: true,
        isFetching: false,
        data: undefined,
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(shouldShowLoading(queryResult)).toBe(true);
    });

    it("should return true when mutation is pending", () => {
      // Arrange
      const mutationResult = {
        isPending: true,
        data: undefined,
        error: null,
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
      } as unknown as UseMutationResult<string, unknown, unknown, unknown>;

      // Act & Assert
      expect(shouldShowLoading(mutationResult)).toBe(true);
    });

    it("should return false when not loading", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: "test",
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(shouldShowLoading(queryResult)).toBe(false);
    });
  });

  describe("shouldShowError", () => {
    it("should return true when query has error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: undefined,
        error: { code: "TEST_ERROR" },
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(shouldShowError(queryResult)).toBe(true);
    });

    it("should return false when query has no error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        data: "test",
        error: null,
      } as unknown as UseQueryResult<string, unknown>;

      // Act & Assert
      expect(shouldShowError(queryResult)).toBe(false);
    });
  });

  describe("shouldShowEmpty", () => {
    it("should return true when data is empty and not loading", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        isPending: false,
        data: [],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(shouldShowEmpty(queryResult)).toBe(true);
    });

    it("should return false when loading", () => {
      // Arrange
      const queryResult = {
        isLoading: true,
        isFetching: false,
        isPending: false,
        data: [],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(shouldShowEmpty(queryResult)).toBe(false);
    });

    it("should return false when there is an error", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        isPending: false,
        data: [],
        error: { code: "TEST_ERROR" },
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(shouldShowEmpty(queryResult)).toBe(false);
    });

    it("should return false when data is not empty", () => {
      // Arrange
      const queryResult = {
        isLoading: false,
        isFetching: false,
        isPending: false,
        data: ["item"],
        error: null,
      } as unknown as UseQueryResult<string[], unknown>;

      // Act & Assert
      expect(shouldShowEmpty(queryResult)).toBe(false);
    });
  });
});

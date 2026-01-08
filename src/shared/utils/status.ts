import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

/**
 * Status object representing the current state of a React Query result.
 * Provides a unified interface for checking loading, error, and empty states.
 *
 * @template TData The type of the data returned by the query/mutation
 */
type QueryStatus = {
  /**
   * Whether the query is currently loading (initial fetch with no cached data).
   * For mutations, this is always false (use isPending instead).
   */
  isLoading: boolean;

  /**
   * Whether the query is currently fetching (including background refetches).
   * For mutations, this is always false (use isPending instead).
   */
  isFetching: boolean;

  /**
   * Whether the mutation is currently pending.
   * For queries, this is always false (use isLoading/isFetching instead).
   */
  isPending: boolean;

  /**
   * Whether there is an error in the query/mutation result.
   */
  hasError: boolean;

  /**
   * Whether the data is empty (null, undefined, or empty array).
   * Only meaningful when there's no error and data is available.
   */
  isEmpty: boolean;

  /**
   * Whether the query/mutation is in a loading state (any type).
   * Combines isLoading, isFetching, and isPending for convenience.
   */
  isAnyLoading: boolean;
};

/**
 * Type guard to check if a value is a React Query result.
 *
 * @param value - Value to check
 * @returns true if value has React Query result properties
 */
const isQueryResult = (
  value: unknown
): value is UseQueryResult<unknown, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("isLoading" in value || "isFetching" in value)
  );
};

/**
 * Type guard to check if a value is a React Query mutation result.
 *
 * @param value - Value to check
 * @returns true if value has React Query mutation result properties
 */
const isMutationResult = (
  value: unknown
): value is UseMutationResult<unknown, unknown, unknown, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    "isPending" in value &&
    "mutate" in value
  );
};

/**
 * Checks if query data is empty.
 * Handles null, undefined, and empty arrays.
 *
 * @param data - Data to check
 * @returns true if data is empty, false otherwise
 */
const isEmptyData = (data: unknown): boolean => {
  if (data === null || data === undefined) {
    return true;
  }

  if (Array.isArray(data)) {
    return data.length === 0;
  }

  // For objects, consider empty if no keys
  if (typeof data === "object") {
    return Object.keys(data).length === 0;
  }

  return false;
};

/**
 * Checks if a query is in a loading state.
 * Returns true if isLoading is true (initial fetch with no cached data).
 *
 * @param queryResult - React Query result
 * @returns true if query is loading, false otherwise
 */
export const isQueryLoading = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  return queryResult.isLoading === true;
};

/**
 * Checks if a query has an error.
 *
 * @param queryResult - React Query result
 * @returns true if query has error, false otherwise
 */
export const isQueryError = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  return queryResult.error !== null && queryResult.error !== undefined;
};

/**
 * Checks if query data is empty.
 * Only checks if data exists and is not empty - does not check for errors.
 *
 * @param queryResult - React Query result
 * @returns true if data is empty, false otherwise
 */
export const isQueryEmpty = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
): boolean => {
  if (isQueryError(queryResult)) {
    return false; // Don't consider empty if there's an error
  }

  return isEmptyData(queryResult.data);
};

/**
 * Checks if a mutation is pending.
 *
 * @param mutationResult - React Query mutation result
 * @returns true if mutation is pending, false otherwise
 */
export const isMutationPending = <TData, TError, TVariables, TContext>(
  mutationResult: UseMutationResult<TData, TError, TVariables, TContext>
): boolean => {
  return mutationResult.isPending === true;
};

/**
 * Checks if a mutation has an error.
 *
 * @param mutationResult - React Query mutation result
 * @returns true if mutation has error, false otherwise
 */
export const isMutationError = <TData, TError, TVariables, TContext>(
  mutationResult: UseMutationResult<TData, TError, TVariables, TContext>
): boolean => {
  return mutationResult.error !== null && mutationResult.error !== undefined;
};

/**
 * Gets a unified status object from a React Query result.
 * Works with both query and mutation results.
 *
 * @param result - React Query query or mutation result
 * @returns QueryStatus object with all status flags
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useProjects();
 * const status = getQueryStatus({ data, isLoading, error });
 *
 * if (status.isLoading) return <Loader />;
 * if (status.hasError) return <ErrorMessage error={error} />;
 * if (status.isEmpty) return <EmptyState />;
 * ```
 */
export const getQueryStatus = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        data?: TData | null;
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
        error?: unknown;
      }
): QueryStatus => {
  // Handle React Query result objects
  if (isQueryResult(result)) {
    const queryResult = result as UseQueryResult<TData, unknown>;
    const hasError = isQueryError(queryResult);
    const isEmpty = !hasError && isEmptyData(queryResult.data);

    return {
      isLoading: queryResult.isLoading ?? false,
      isFetching: queryResult.isFetching ?? false,
      isPending: false,
      hasError,
      isEmpty,
      isAnyLoading:
        queryResult.isLoading === true || queryResult.isFetching === true,
    };
  }

  // Handle React Query mutation results
  if (isMutationResult(result)) {
    const mutationResult = result as UseMutationResult<
      TData,
      unknown,
      unknown,
      unknown
    >;
    const hasError = isMutationError(mutationResult);
    const isEmpty = !hasError && isEmptyData(mutationResult.data);

    return {
      isLoading: false,
      isFetching: false,
      isPending: mutationResult.isPending ?? false,
      hasError,
      isEmpty,
      isAnyLoading: mutationResult.isPending === true,
    };
  }

  // Handle plain objects (for flexibility)
  const hasError = result.error !== null && result.error !== undefined;
  const isEmpty = !hasError && isEmptyData(result.data);

  return {
    isLoading: result.isLoading ?? false,
    isFetching: result.isFetching ?? false,
    isPending: result.isPending ?? false,
    hasError,
    isEmpty,
    isAnyLoading:
      result.isLoading === true ||
      result.isFetching === true ||
      result.isPending === true,
  };
};

/**
 * Determines if loading state should be shown.
 * Returns true if query is in initial loading state (isLoading, not isFetching).
 *
 * @param result - React Query result
 * @returns true if loading should be shown, false otherwise
 */
export const shouldShowLoading = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
      }
): boolean => {
  const status = getQueryStatus(result);
  return status.isLoading || status.isPending;
};

/**
 * Determines if error state should be shown.
 * Returns true if there's an error and data is not available.
 *
 * @param result - React Query result
 * @returns true if error should be shown, false otherwise
 */
export const shouldShowError = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        error?: unknown;
        data?: TData | null;
      }
): boolean => {
  const status = getQueryStatus(result);
  return status.hasError;
};

/**
 * Determines if empty state should be shown.
 * Returns true if there's no error, no loading, and data is empty.
 *
 * @param result - React Query result
 * @returns true if empty state should be shown, false otherwise
 */
export const shouldShowEmpty = <TData>(
  result:
    | UseQueryResult<TData, unknown>
    | UseMutationResult<TData, unknown, unknown, unknown>
    | {
        data?: TData | null;
        isLoading?: boolean;
        isFetching?: boolean;
        isPending?: boolean;
        error?: unknown;
      }
): boolean => {
  const status = getQueryStatus(result);
  return !status.isAnyLoading && !status.hasError && status.isEmpty;
};

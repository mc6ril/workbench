import type { PropsWithChildren, ReactElement } from "react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";

export type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** Optional custom QueryClient instance for fine-grained control in tests. */
  queryClient?: QueryClient;
};

/**
 * Creates a lightweight QueryClient preconfigured for tests.
 * - disables retries to keep tests deterministic
 * - keeps cache small to avoid leaking state across tests
 */
const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * Renders a React element wrapped with common application providers.
 *
 * Currently wires:
 * - React Query (QueryClientProvider)
 *
 * Additional providers (Zustand, routing, theming, etc.) can be added here
 * over time without changing individual tests.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { queryClient, ...options }: RenderWithProvidersOptions = {}
) => {
  const client = queryClient ?? createTestQueryClient();

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

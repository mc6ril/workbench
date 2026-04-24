import { cookies } from "next/headers";
import { render, screen } from "@testing-library/react";

import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProtectedLayout from "@/app/(protected)/layout";

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  dehydrated: true,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("@/shared/providers/AppProvider", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      children,
    }: {
      children: React.ReactNode;
      dehydratedState?: unknown;
    }) => <>{children}</>
  ),
}));

jest.mock("@/shared/providers/RequestIntlProvider", () => ({
  __esModule: true,
  default: jest.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

describe("ProtectedLayout hydration", () => {
  const mockQueryClient = {
    setQueryData: jest.fn(),
    prefetchQuery: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ dehydrated: true });

    mockQueryClient.setQueryData.mockReset();
    mockQueryClient.prefetchQuery.mockReset();

    jest.mocked(createAppQueryClient).mockReturnValue(mockQueryClient as never);
    jest.mocked(cookies).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "dark" }),
    } as never);
  });

  it("renders protected children without SSR session/profile hydration", async () => {
    const result = await ProtectedLayout({
      children: <div>Protected content</div>,
    });

    render(result);

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
    expect(mockQueryClient.prefetchQuery).not.toHaveBeenCalled();
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);

    const appProviderMock = jest.mocked(AppProvider);
    expect(appProviderMock).toHaveBeenCalledTimes(1);
    expect(appProviderMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        dehydratedState: { dehydrated: true },
        initialTheme: "dark",
      })
    );
  });
});

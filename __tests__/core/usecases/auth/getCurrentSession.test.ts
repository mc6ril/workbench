import type { AuthSession } from "@/core/domain/schema/auth.schema";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthSession,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("getCurrentSession", () => {
  const mockSession = mockAuthSession;

  it("should return session when user is authenticated", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      getSession: jest.fn<Promise<AuthSession | null>, []>(
        async () => mockSession
      ),
    });

    // Act
    const result = await getCurrentSession(repository);

    // Assert
    expect(repository.getSession).toHaveBeenCalledTimes(1);
    expect(repository.getSession).toHaveBeenCalledWith();
    expect(result).toEqual(mockSession);
  });

  it("should throw NotFoundError when no session exists", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      getSession: jest.fn<Promise<AuthSession | null>, []>(async () => null),
    });

    // Act & Assert
    await expect(getCurrentSession(repository)).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Session",
      entityId: "",
    });
    expect(repository.getSession).toHaveBeenCalledTimes(1);
    expect(repository.getSession).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Session retrieval failed"
    );
    const repository = createAuthRepositoryMock({
      getSession: jest.fn<Promise<AuthSession | null>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await getCurrentSession(repository);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.getSession).toHaveBeenCalledTimes(1);
  });
});

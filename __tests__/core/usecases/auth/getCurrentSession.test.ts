// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createSessionRepositoryMock } from "../../../../__mocks__/core/ports/sessionRepository";

import type { CurrentSession } from "@/domains/session/core/domain/currentSession.schema";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";

describe("getCurrentSession", () => {
  const mockSession = mockCurrentSession;

  it("should return session when user is authenticated", async () => {
    // Arrange
    const repository = createSessionRepositoryMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => mockSession
      ),
    });

    // Act
    const result = await getCurrentSession(repository);

    // Assert
    expect(repository.getCurrentSession).toHaveBeenCalledTimes(1);
    expect(repository.getCurrentSession).toHaveBeenCalledWith();
    expect(result).toEqual(mockSession);
  });

  it("should throw NotFoundError when no session exists", async () => {
    // Arrange
    const repository = createSessionRepositoryMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => null
      ),
    });

    // Act & Assert
    await expect(getCurrentSession(repository)).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Session",
      entityId: "",
    });
    expect(repository.getCurrentSession).toHaveBeenCalledTimes(1);
    expect(repository.getCurrentSession).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Session retrieval failed"
    );
    const repository = createSessionRepositoryMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => {
          throw repositoryError;
        }
      ),
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
    expect(repository.getCurrentSession).toHaveBeenCalledTimes(1);
  });
});

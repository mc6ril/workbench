import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
import { createSessionGatewayMock } from "../../../../__mocks__/core/ports/sessionGateway";

import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";

describe("getCurrentSession", () => {
  const mockSession = mockCurrentSession;

  it("should return session when user is authenticated", async () => {
    // Arrange
    const gateway = createSessionGatewayMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => mockSession
      ),
    });

    // Act
    const result = await getCurrentSession(gateway);

    // Assert
    expect(gateway.getCurrentSession).toHaveBeenCalledTimes(1);
    expect(gateway.getCurrentSession).toHaveBeenCalledWith();
    expect(result).toEqual(mockSession);
  });

  it("should throw NotFoundError when no session exists", async () => {
    // Arrange
    const gateway = createSessionGatewayMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => null
      ),
    });

    // Act & Assert
    await expect(getCurrentSession(gateway)).rejects.toMatchObject({
      code: "NOT_FOUND",
      context: {
        entityType: "Session",
        entityId: "",
      },
    });
    expect(gateway.getCurrentSession).toHaveBeenCalledTimes(1);
    expect(gateway.getCurrentSession).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from gateway", async () => {
    // Arrange
    const gatewayError = createAuthError.authentication(
      "Session retrieval failed"
    );
    const gateway = createSessionGatewayMock({
      getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(
        async () => {
          throw gatewayError;
        }
      ),
    });

    // Act & Assert
    try {
      await getCurrentSession(gateway);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(gateway.getCurrentSession).toHaveBeenCalledTimes(1);
  });
});

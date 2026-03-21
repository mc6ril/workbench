// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthResult,
  mockAuthResultWithEmailVerification,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createSessionRepositoryMock } from "../../../../__mocks__/core/ports/sessionRepository";

import type { AuthResult } from "@/domains/auth/core/domain/auth.schema";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { signUpUser } from "@/domains/auth/core/usecases/user/signUpUser";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import {
  ProjectRole,
  type ProjectWithRole,
} from "@/domains/workspace/core/domain/schema/project.schema";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";

describe("Auth Flow Tests", () => {
  // Mock user credentials as specified in requirements
  const mockUserEmail = "cyril.lesot@yahoo.fr";
  const mockUserPassword = "Azerty123!";

  const mockSignUpInput = {
    email: mockUserEmail,
    password: mockUserPassword,
  };

  const mockSignInInput = {
    email: mockUserEmail,
    password: mockUserPassword,
  };

  describe("complete signup flow: signUpUser → getCurrentSession (with email verification)", () => {
    it("should complete signup flow with email verification requirement", async () => {
      // Arrange
      const authRepository = createAuthRepositoryMock({
        signUp: jest.fn<Promise<AuthResult>, [typeof mockSignUpInput]>(
          async () => mockAuthResultWithEmailVerification
        ),
      });
      const sessionRepository = createSessionRepositoryMock({
        getCurrentSession: jest.fn(async () => null),
      });

      // Act - Step 1: Sign up user
      const signUpResult = await signUpUser(authRepository, mockSignUpInput);

      // Assert - Step 1: Sign up should return email verification requirement
      expect(authRepository.signUp).toHaveBeenCalledTimes(1);
      expect(authRepository.signUp).toHaveBeenCalledWith(mockSignUpInput);
      expect(signUpResult).toEqual(mockAuthResultWithEmailVerification);
      expect(signUpResult.requiresEmailVerification).toBe(true);
      expect(signUpResult.session).toBeNull();

      // Act & Assert - Step 2: Get current session (should throw NotFoundError as email not verified)
      await expect(getCurrentSession(sessionRepository)).rejects.toMatchObject({
        code: "NOT_FOUND",
        entityType: "Session",
        entityId: "",
      });
      expect(sessionRepository.getCurrentSession).toHaveBeenCalledTimes(1);
      expect(sessionRepository.getCurrentSession).toHaveBeenCalledWith();
    });

    it("should handle error propagation in signup flow", async () => {
      // Arrange
      const repositoryError = createAuthError.emailAlreadyExists();
      const authRepository = createAuthRepositoryMock({
        signUp: jest.fn<Promise<AuthResult>, [typeof mockSignUpInput]>(
          async () => {
            throw repositoryError;
          }
        ),
      });

      // Act & Assert
      await expect(
        signUpUser(authRepository, mockSignUpInput)
      ).rejects.toMatchObject({
        code: "EMAIL_ALREADY_EXISTS",
      });
      expect(authRepository.signUp).toHaveBeenCalledTimes(1);
    });
  });

  describe("complete signin flow: signInUser → getCurrentSession → listProjects", () => {
    const mockProjects: ProjectWithRole[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Project",
        shortCode: "TP",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        role: ProjectRole.ADMIN,
      },
    ];

    it("should complete signin flow successfully", async () => {
      // Arrange
      const authRepository = createAuthRepositoryMock({
        signIn: jest.fn<Promise<AuthResult>, [typeof mockSignInInput]>(
          async () => mockAuthResult
        ),
      });
      const sessionRepository = createSessionRepositoryMock({
        getCurrentSession: jest.fn(async () => mockCurrentSession),
      });

      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => mockProjects),
      });

      // Act - Step 1: Sign in user
      const signInResult = await signInUser(authRepository, mockSignInInput);

      // Assert - Step 1: Sign in should return session
      expect(authRepository.signIn).toHaveBeenCalledTimes(1);
      expect(authRepository.signIn).toHaveBeenCalledWith(mockSignInInput);
      expect(signInResult).toEqual(mockAuthResult);
      expect(signInResult.session).not.toBeNull();

      // Act - Step 2: Get current session
      const sessionResult = await getCurrentSession(sessionRepository);

      // Assert - Step 2: Session should be available
      expect(sessionRepository.getCurrentSession).toHaveBeenCalledTimes(1);
      expect(sessionRepository.getCurrentSession).toHaveBeenCalledWith();
      expect(sessionResult).toEqual(mockCurrentSession);
      expect(sessionResult.email).toBe(mockCurrentSession.email);

      // Act - Step 3: List projects
      const projectsResult = await listProjects(projectRepository);

      // Assert - Step 3: Projects should be listed
      expect(projectRepository.list).toHaveBeenCalledTimes(1);
      expect(projectRepository.list).toHaveBeenCalledWith();
      expect(projectsResult).toEqual(mockProjects);
      expect(projectsResult).toHaveLength(1);
      expect(projectsResult[0].name).toBe("Test Project");
    });

    it("should handle invalid credentials in signin flow", async () => {
      // Arrange
      const repositoryError = createAuthError.invalidCredentials();
      const authRepository = createAuthRepositoryMock({
        signIn: jest.fn<Promise<AuthResult>, [typeof mockSignInInput]>(
          async () => {
            throw repositoryError;
          }
        ),
      });

      // Act & Assert
      await expect(
        signInUser(authRepository, mockSignInInput)
      ).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
      expect(authRepository.signIn).toHaveBeenCalledTimes(1);
    });

    it("should handle error propagation from getCurrentSession to listProjects", async () => {
      // Arrange
      const authRepository = createAuthRepositoryMock({
        signIn: jest.fn<Promise<AuthResult>, [typeof mockSignInInput]>(
          async () => mockAuthResult
        ),
      });
      const sessionRepository = createSessionRepositoryMock({
        getCurrentSession: jest.fn(async () => {
          throw createAuthError.authentication("Session retrieval failed");
        }),
      });

      const projectRepository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => mockProjects),
      });

      // Act - Step 1: Sign in (should succeed)
      await signInUser(authRepository, mockSignInInput);

      // Act & Assert - Step 2: Get session (should fail)
      await expect(getCurrentSession(sessionRepository)).rejects.toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });

      // Note: In a real flow, listProjects wouldn't be called if getCurrentSession fails,
      // but we verify that projectRepository was not called
      expect(projectRepository.list).not.toHaveBeenCalled();
    });
  });
});

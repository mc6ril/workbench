import {
  createAuthError,
  mockAuthResult,
  mockAuthResultWithEmailVerification,
} from "../../../../__mocks__/core/domain/authMocks";
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";
import { createProjectGatewayMock } from "../../../../__mocks__/core/ports/projectGateway";

import type {
  AuthResult,
  SignUpInput,
} from "@/domains/auth/core/domain/auth.types";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { signUpUser } from "@/domains/auth/core/usecases/user/signUpUser";
import {
  ProjectRole,
  type ProjectWithRole,
} from "@/domains/project/core/domain/project.types";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";

describe("Auth Flow Tests", () => {
  // Mock user credentials as specified in requirements
  const mockUserEmail = "cyril.lesot@yahoo.fr";
  const mockUserPassword = "Azerty123!";

  const mockSignUpInput = {
    email: mockUserEmail,
    password: mockUserPassword,
    locale: "fr" as const,
  };

  const mockSignInInput = {
    email: mockUserEmail,
    password: mockUserPassword,
  };

  describe("complete signup flow with email verification", () => {
    it("should complete signup flow with email verification requirement", async () => {
      // Arrange
      const authRepository = createAuthRepositoryMock({
        signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(
          async () => mockAuthResultWithEmailVerification
        ),
      });

      // Act - Step 1: Sign up user
      const signUpResult = await signUpUser(authRepository, mockSignUpInput);

      // Assert - Step 1: Sign up should return email verification requirement
      expect(authRepository.signUp).toHaveBeenCalledTimes(1);
      expect(authRepository.signUp).toHaveBeenCalledWith(mockSignUpInput);
      expect(signUpResult).toEqual(mockAuthResultWithEmailVerification);
      expect(signUpResult.requiresEmailVerification).toBe(true);
      expect(signUpResult.session).toBeNull();
    });

    it("should handle error propagation in signup flow", async () => {
      // Arrange
      const repositoryError = createAuthError.emailAlreadyExists();
      const authRepository = createAuthRepositoryMock({
        signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(async () => {
          throw repositoryError;
        }),
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

  describe("complete signin flow: signInUser → listProjects", () => {
    const mockProjects: ProjectWithRole[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Project",
        shortCode: "TP",
        boardEmoji: "📋",
        enabledModules: [],
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
      const projectRepository = createProjectGatewayMock({
        listProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
          async () => mockProjects
        ),
      });

      // Act - Step 1: Sign in user
      const signInResult = await signInUser(authRepository, mockSignInInput);

      // Assert - Step 1: Sign in should return auth identity
      expect(authRepository.signIn).toHaveBeenCalledTimes(1);
      expect(authRepository.signIn).toHaveBeenCalledWith(mockSignInInput);
      expect(signInResult).toEqual(mockAuthResult);
      expect(signInResult.session).not.toBeNull();

      // Act - Step 2: List projects
      const projectsResult = await listProjects(projectRepository);

      // Assert - Step 2: Projects should be listed
      expect(projectRepository.listProjects).toHaveBeenCalledTimes(1);
      expect(projectRepository.listProjects).toHaveBeenCalledWith();
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
  });
});

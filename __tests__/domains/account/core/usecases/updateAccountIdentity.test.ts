import { z } from "zod";

import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";
import { updateAccountIdentity } from "@/domains/account/core/usecases/updateAccountIdentity";

const createAccountGatewayMock = (): jest.Mocked<AccountGateway> => ({
  updateProfile: jest.fn<Promise<void>, [string, { displayName?: string }]>(),
  updatePreferences: jest.fn(),
  uploadAvatar: jest.fn(),
  deleteAvatar: jest.fn(),
  updateEmail: jest.fn<Promise<void>, [string]>(),
});

describe("updateAccountIdentity", () => {
  it("updates the display name and email with normalized input", async () => {
    const gateway = createAccountGatewayMock();

    await updateAccountIdentity(gateway, "user-1", {
      displayName: "  Camille  ",
      email: "  camille@example.com  ",
    });

    expect(gateway.updateProfile).toHaveBeenCalledTimes(1);
    expect(gateway.updateProfile).toHaveBeenCalledWith("user-1", {
      displayName: "Camille",
    });
    expect(gateway.updateEmail).toHaveBeenCalledTimes(1);
    expect(gateway.updateEmail).toHaveBeenCalledWith("camille@example.com");
  });

  it("treats a blank email as an omitted update", async () => {
    const gateway = createAccountGatewayMock();

    await updateAccountIdentity(gateway, "user-1", {
      email: "   ",
    });

    expect(gateway.updateProfile).not.toHaveBeenCalled();
    expect(gateway.updateEmail).not.toHaveBeenCalled();
  });

  it("still updates the email when no user id is available", async () => {
    const gateway = createAccountGatewayMock();

    await updateAccountIdentity(gateway, undefined, {
      displayName: "Camille",
      email: "camille@example.com",
    });

    expect(gateway.updateProfile).not.toHaveBeenCalled();
    expect(gateway.updateEmail).toHaveBeenCalledTimes(1);
    expect(gateway.updateEmail).toHaveBeenCalledWith("camille@example.com");
  });

  it("rejects an invalid email", async () => {
    const gateway = createAccountGatewayMock();

    await expect(
      updateAccountIdentity(gateway, "user-1", {
        email: "not-an-email",
      })
    ).rejects.toThrow(z.ZodError);

    expect(gateway.updateProfile).not.toHaveBeenCalled();
    expect(gateway.updateEmail).not.toHaveBeenCalled();
  });
});

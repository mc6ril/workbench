import { z } from "zod";

import { updateAccountIdentity } from "@/domains/settings/core/usecases/updateAccountIdentity";

const createAccountIdentityGatewayMock = () => ({
  updateDisplayName: jest.fn<Promise<void>, [string, string]>(),
  updateEmail: jest.fn<Promise<void>, [string]>(),
});

describe("updateAccountIdentity", () => {
  it("updates the display name and email with normalized input", async () => {
    const gateway = createAccountIdentityGatewayMock();

    await updateAccountIdentity(gateway, "user-1", {
      displayName: "  Camille  ",
      email: "  camille@example.com  ",
    });

    expect(gateway.updateDisplayName).toHaveBeenCalledTimes(1);
    expect(gateway.updateDisplayName).toHaveBeenCalledWith("user-1", "Camille");
    expect(gateway.updateEmail).toHaveBeenCalledTimes(1);
    expect(gateway.updateEmail).toHaveBeenCalledWith("camille@example.com");
  });

  it("treats a blank email as an omitted update", async () => {
    const gateway = createAccountIdentityGatewayMock();

    await updateAccountIdentity(gateway, "user-1", {
      email: "   ",
    });

    expect(gateway.updateDisplayName).not.toHaveBeenCalled();
    expect(gateway.updateEmail).not.toHaveBeenCalled();
  });

  it("still updates the email when no user id is available", async () => {
    const gateway = createAccountIdentityGatewayMock();

    await updateAccountIdentity(gateway, undefined, {
      displayName: "Camille",
      email: "camille@example.com",
    });

    expect(gateway.updateDisplayName).not.toHaveBeenCalled();
    expect(gateway.updateEmail).toHaveBeenCalledTimes(1);
    expect(gateway.updateEmail).toHaveBeenCalledWith("camille@example.com");
  });

  it("rejects an invalid email", async () => {
    const gateway = createAccountIdentityGatewayMock();

    await expect(
      updateAccountIdentity(gateway, "user-1", {
        email: "not-an-email",
      })
    ).rejects.toThrow(z.ZodError);

    expect(gateway.updateDisplayName).not.toHaveBeenCalled();
    expect(gateway.updateEmail).not.toHaveBeenCalled();
  });
});

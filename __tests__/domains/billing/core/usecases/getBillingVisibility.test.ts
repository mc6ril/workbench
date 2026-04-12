import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";

const createBillingVisibilityPortMock = () => ({
  getBillingVisibility: jest.fn<Promise<boolean>, []>(),
});

describe("getBillingVisibility", () => {
  it("returns the local override without reading runtime config", async () => {
    const billingVisibilityPort = createBillingVisibilityPortMock();

    await expect(
      getBillingVisibility(billingVisibilityPort, {
        overrideValue: false,
      })
    ).resolves.toBe(false);

    expect(billingVisibilityPort.getBillingVisibility).not.toHaveBeenCalled();
  });

  it("falls back to the runtime config port for regular users", async () => {
    const billingVisibilityPort = createBillingVisibilityPortMock();
    billingVisibilityPort.getBillingVisibility.mockResolvedValue(false);

    await expect(getBillingVisibility(billingVisibilityPort)).resolves.toBe(
      false
    );

    expect(billingVisibilityPort.getBillingVisibility).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the runtime config port throws", async () => {
    const billingVisibilityPort = createBillingVisibilityPortMock();
    billingVisibilityPort.getBillingVisibility.mockRejectedValue(
      new Error("boom")
    );

    await expect(getBillingVisibility(billingVisibilityPort)).resolves.toBe(
      false
    );
  });
});

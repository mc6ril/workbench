import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";

const createRuntimeConfigPortMock = () => ({
  getValue: jest.fn<Promise<unknown>, [string]>(),
  listEntries: jest.fn(),
});

describe("getRuntimeConfigBoolean", () => {
  it("returns the local override without reading runtime config", async () => {
    const runtimeConfigPort = createRuntimeConfigPortMock();

    await expect(
      getRuntimeConfigBoolean(runtimeConfigPort, {
        key: "is_billing_visible",
        defaultValue: false,
        overrideValue: false,
      })
    ).resolves.toBe(false);

    expect(runtimeConfigPort.getValue).not.toHaveBeenCalled();
  });

  it("returns the boolean value when the config entry is a boolean", async () => {
    const runtimeConfigPort = createRuntimeConfigPortMock();
    runtimeConfigPort.getValue.mockResolvedValue(true);

    await expect(
      getRuntimeConfigBoolean(runtimeConfigPort, {
        key: "is_billing_visible",
        defaultValue: false,
      })
    ).resolves.toBe(true);

    expect(runtimeConfigPort.getValue).toHaveBeenCalledWith(
      "is_billing_visible"
    );
  });

  it("falls back to the provided default when the config entry is not a boolean", async () => {
    const runtimeConfigPort = createRuntimeConfigPortMock();
    runtimeConfigPort.getValue.mockResolvedValue("true");

    await expect(
      getRuntimeConfigBoolean(runtimeConfigPort, {
        key: "is_billing_visible",
        defaultValue: false,
      })
    ).resolves.toBe(false);
  });

  it("fails closed to the provided default when reading config throws", async () => {
    const runtimeConfigPort = createRuntimeConfigPortMock();
    runtimeConfigPort.getValue.mockRejectedValue(new Error("boom"));

    await expect(
      getRuntimeConfigBoolean(runtimeConfigPort, {
        key: "is_billing_visible",
        defaultValue: false,
      })
    ).resolves.toBe(false);
  });
});

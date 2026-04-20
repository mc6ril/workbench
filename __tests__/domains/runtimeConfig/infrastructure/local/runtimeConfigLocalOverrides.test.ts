import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

import {
  getRuntimeConfigBooleanOverride,
  getRuntimeConfigEvaluationCacheTag,
  readRuntimeConfigBooleanOverridesFromCookieHeader,
  readRuntimeConfigBooleanOverridesFromCookieValue,
  serializeRuntimeConfigBooleanOverrides,
  withRuntimeConfigBooleanOverride,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";

describe("runtimeConfigLocalOverrides", () => {
  it("round-trips boolean overrides through the cookie serializer", () => {
    const serializedValue = serializeRuntimeConfigBooleanOverrides({
      is_billing_visible: true,
      is_recipes_board_visible: false,
    });

    expect(
      readRuntimeConfigBooleanOverridesFromCookieValue(serializedValue)
    ).toEqual({
      is_billing_visible: true,
      is_recipes_board_visible: false,
    });
  });

  it("ignores non-boolean entries from the cookie payload", () => {
    const cookieValue = encodeURIComponent(
      JSON.stringify({
        is_billing_visible: true,
        invalid_string: "true",
        invalid_number: 1,
      })
    );

    expect(
      readRuntimeConfigBooleanOverridesFromCookieValue(cookieValue)
    ).toEqual({
      is_billing_visible: true,
    });
  });

  it("reads overrides from a cookie header", () => {
    const cookieValue = serializeRuntimeConfigBooleanOverrides({
      is_billing_visible: true,
    });

    expect(
      readRuntimeConfigBooleanOverridesFromCookieHeader(
        `theme=dark; ${APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES}=${cookieValue}`
      )
    ).toEqual({
      is_billing_visible: true,
    });
  });

  it("returns override evaluation tags for boolean overrides", () => {
    expect(getRuntimeConfigEvaluationCacheTag({ overrideValue: false })).toBe(
      "override:false"
    );
  });

  it("updates one override while preserving the others", () => {
    expect(
      withRuntimeConfigBooleanOverride({
        overrides: {
          is_billing_visible: true,
          is_recipes_board_visible: false,
        },
        key: "is_billing_visible",
        value: false,
        remoteValue: true,
      })
    ).toEqual({
      is_billing_visible: false,
      is_recipes_board_visible: false,
    });
  });

  it("removes an override when it matches the remote value again", () => {
    const overrides = withRuntimeConfigBooleanOverride({
      overrides: {
        is_billing_visible: false,
      },
      key: "is_billing_visible",
      value: true,
      remoteValue: true,
    });

    expect(overrides).toEqual({});
    expect(
      getRuntimeConfigBooleanOverride(overrides, "is_billing_visible")
    ).toBeUndefined();
  });
});

import {
  getVerifyEmailRedirectErrorCode,
  parseVerifyEmailParams,
} from "@/domains/auth/presentation/utils/verifyEmail";

describe("parseVerifyEmailParams", () => {
  it("parses a PKCE code verification link", () => {
    const result = parseVerifyEmailParams(
      new URLSearchParams("code=abc123&type=email")
    );

    expect(result).toEqual({
      input: {
        code: "abc123",
        type: "email",
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    });
  });

  it("parses a token hash verification link", () => {
    const result = parseVerifyEmailParams(
      new URLSearchParams("token_hash=hash123&type=signup")
    );

    expect(result).toEqual({
      input: {
        tokenHash: "hash123",
        type: "signup",
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    });
  });

  it("parses a legacy token verification link", () => {
    const result = parseVerifyEmailParams(
      new URLSearchParams(
        "token=legacy-token&type=email&email=test%40example.com"
      )
    );

    expect(result).toEqual({
      input: {
        email: "test@example.com",
        token: "legacy-token",
        type: "email",
      },
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: false,
    });
  });

  it("marks callback redirects as session recovery flows", () => {
    const result = parseVerifyEmailParams(
      new URLSearchParams("verified=1")
    );

    expect(result).toEqual({
      input: null,
      redirectError: null,
      isMissingToken: false,
      shouldRecoverSession: true,
    });
  });

  it("reads redirect errors from the URL hash", () => {
    const result = parseVerifyEmailParams(
      new URLSearchParams(),
      "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"
    );

    expect(result).toEqual({
      input: null,
      redirectError: {
        code: "otp_expired",
        description: "Email link is invalid or has expired",
      },
      isMissingToken: false,
      shouldRecoverSession: false,
    });
  });

  it("marks links without payload as missing token", () => {
    const result = parseVerifyEmailParams(new URLSearchParams());

    expect(result).toEqual({
      input: null,
      redirectError: null,
      isMissingToken: true,
      shouldRecoverSession: false,
    });
  });
});

describe("getVerifyEmailRedirectErrorCode", () => {
  it("maps expired redirect errors to INVALID_TOKEN", () => {
    expect(
      getVerifyEmailRedirectErrorCode({
        code: "otp_expired",
        description: "Email link is invalid or has expired",
      })
    ).toBe("INVALID_TOKEN");
  });

  it("maps unknown redirect errors to EMAIL_VERIFICATION_ERROR", () => {
    expect(
      getVerifyEmailRedirectErrorCode({
        code: "access_denied",
        description: "Something else happened",
      })
    ).toBe("EMAIL_VERIFICATION_ERROR");
  });
});

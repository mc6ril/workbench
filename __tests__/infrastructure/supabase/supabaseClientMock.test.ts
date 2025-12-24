import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createSupabaseClientMock } from "../../../__mocks__/infrastructure/supabase/supabaseClientMock";

describe("createSupabaseClientMock", () => {
  it("returns a SupabaseClient-typed object using the provided overrides", async () => {
    const signInWithPassword = jest.fn();

    const client = createSupabaseClientMock({
      auth: {
        signInWithPassword,
      } as unknown as SupabaseClient["auth"],
    });

    await client.auth?.signInWithPassword({
      email: "test@example.com",
      password: "password",
    });

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });
});

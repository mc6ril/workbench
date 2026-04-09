import { getBoardColumnDisplayName } from "@/modules/board/presentation/utils/columnI18n";

describe("getBoardColumnDisplayName", () => {
  const knownKeys = new Set([
    "todo",
    "in_progress",
    "done",
    "in-progress",
    "completed",
  ]);
  const tColumns = Object.assign((key: string) => `translated:${key}`, {
    has: (key: string) => knownKeys.has(key),
  });

  it("translates default workflow columns using their stored key", () => {
    expect(
      getBoardColumnDisplayName(
        {
          key: "todo",
          name: "Todo",
        },
        tColumns
      )
    ).toBe("translated:todo");
  });

  it("translates historical in-progress keys when the message key exists", () => {
    expect(
      getBoardColumnDisplayName(
        {
          key: "in-progress",
          name: "In Progress",
        },
        tColumns
      )
    ).toBe("translated:in-progress");
  });

  it("translates historical done keys when the message key exists", () => {
    expect(
      getBoardColumnDisplayName(
        {
          key: "completed",
          name: "Completed",
        },
        tColumns
      )
    ).toBe("translated:completed");
  });

  it("preserves custom column names when the key is not the default one", () => {
    expect(
      getBoardColumnDisplayName(
        {
          key: "qa-review",
          name: "QA Review",
        },
        tColumns
      )
    ).toBe("QA Review");
  });

  it("preserves the provided name when no key is available", () => {
    expect(
      getBoardColumnDisplayName(
        {
          name: "Done-ish",
        },
        tColumns
      )
    ).toBe("Done-ish");
  });
});

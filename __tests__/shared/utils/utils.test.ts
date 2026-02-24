import { getLastUpdateContent } from "@/shared/utils/utils";

describe("getLastUpdateContent", () => {
  it("should return zeros when date is undefined", () => {
    expect(getLastUpdateContent(undefined)).toEqual({ hours: 0, days: 0 });
  });

  it("should return approximate hours and days for a recent date", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = getLastUpdateContent(twoHoursAgo);

    expect(result.hours).toBe(2);
    expect(result.days).toBe(0);
  });

  it("should return days for a date several days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = getLastUpdateContent(threeDaysAgo);

    expect(result.days).toBe(3);
    expect(result.hours).toBe(72);
  });

  it("should handle a date just now", () => {
    const now = new Date();
    const result = getLastUpdateContent(now);

    expect(result.hours).toBe(0);
    expect(result.days).toBe(0);
  });
});

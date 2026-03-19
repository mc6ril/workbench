import type { Subscription } from "@/domains/billing/core/domain/schema/subscription.schema";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  type UpsertSubscriptionInput,
} from "@/domains/billing/core/domain/schema/subscription.schema";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscriptionRepository";
import { getCurrentUserSubscription } from "@/domains/billing/core/usecases/getCurrentUserSubscription";

const createSubscriptionRepositoryMock = (
  overrides: Partial<SubscriptionRepository> = {}
): SubscriptionRepository => {
  const base: SubscriptionRepository = {
    getCurrent: jest.fn<Promise<Subscription | null>, []>(),
    getByUserId: jest.fn<Promise<Subscription | null>, [string]>(),
    upsert: jest.fn<Promise<Subscription>, [UpsertSubscriptionInput]>(),
    getByStripeCustomerId: jest.fn<Promise<Subscription | null>, [string]>(),
    deleteByUserId: jest.fn<Promise<void>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};

describe("getCurrentUserSubscription", () => {
  it("should return current subscription when found", async () => {
    const now = new Date("2024-01-01T00:00:00Z");
    const subscription: Subscription = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "223e4567-e89b-12d3-a456-426614174000",
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      currentPeriodStart: now,
      currentPeriodEnd: now,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
    const repo = createSubscriptionRepositoryMock({
      getCurrent: jest.fn<Promise<Subscription | null>, []>(
        async () => subscription
      ),
    });

    const result = await getCurrentUserSubscription(repo);

    expect(repo.getCurrent).toHaveBeenCalledTimes(1);
    expect(result).toEqual(subscription);
  });

  it("should return default free subscription when no subscription exists", async () => {
    const repo = createSubscriptionRepositoryMock({
      getCurrent: jest.fn<Promise<Subscription | null>, []>(async () => null),
    });

    const result = await getCurrentUserSubscription(repo);

    expect(repo.getCurrent).toHaveBeenCalledTimes(1);
    expect(result.plan).toBe(SubscriptionPlan.FREE);
    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(result.userId).toBe("");
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new Error("database down");
    const repo = createSubscriptionRepositoryMock({
      getCurrent: jest.fn<Promise<Subscription | null>, []>(async () => {
        throw repositoryError;
      }),
    });

    await expect(getCurrentUserSubscription(repo)).rejects.toThrow(
      repositoryError
    );
  });
});

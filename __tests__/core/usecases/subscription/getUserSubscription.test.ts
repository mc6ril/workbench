import type { Subscription } from "@/domains/billing/core/domain/subscription.types";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/billing/core/domain/subscription.types";
import type {
  SaveSubscriptionInput,
  SubscriptionRepository,
} from "@/domains/billing/core/ports/subscription.repository";
import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";

const createSubscriptionRepositoryMock = (
  overrides: Partial<SubscriptionRepository> = {}
): SubscriptionRepository => {
  const base: SubscriptionRepository = {
    getByUserId: jest.fn<Promise<Subscription | null>, [string]>(),
    save: jest.fn<Promise<Subscription>, [SaveSubscriptionInput]>(),
    getByCustomerId: jest.fn<Promise<Subscription | null>, [string]>(),
    deleteByUserId: jest.fn<Promise<void>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};

describe("getUserSubscription", () => {
  it("should return the user's subscription when found", async () => {
    const now = new Date("2024-01-01T00:00:00Z");
    const subscription: Subscription = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "223e4567-e89b-12d3-a456-426614174000",
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
      customerId: "cus_123",
      subscriptionId: "sub_123",
      currentPeriodStart: now,
      currentPeriodEnd: now,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
    const repo = createSubscriptionRepositoryMock({
      getByUserId: jest.fn<Promise<Subscription | null>, [string]>(
        async () => subscription
      ),
    });

    const result = await getUserSubscription(repo, {
      userId: subscription.userId,
    });

    expect(repo.getByUserId).toHaveBeenCalledWith(subscription.userId);
    expect(result).toEqual(subscription);
  });

  it("should return a free subscription when no subscription exists", async () => {
    const repo = createSubscriptionRepositoryMock({
      getByUserId: jest.fn<Promise<Subscription | null>, [string]>(
        async () => null
      ),
    });
    const userId = "223e4567-e89b-12d3-a456-426614174000";

    const result = await getUserSubscription(repo, { userId });

    expect(repo.getByUserId).toHaveBeenCalledWith(userId);
    expect(result.plan).toBe(SubscriptionPlan.FREE);
    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(result.userId).toBe(userId);
  });

  it("should return a TEAM subscription for superusers", async () => {
    const repo = createSubscriptionRepositoryMock();
    const userId = "223e4567-e89b-12d3-a456-426614174000";

    const result = await getUserSubscription(repo, {
      userId,
      isSuperuser: true,
    });

    expect(repo.getByUserId).not.toHaveBeenCalled();
    expect(result.plan).toBe(SubscriptionPlan.TEAM);
    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(result.userId).toBe(userId);
    expect(result.isSuperuser).toBe(true);
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new Error("database down");
    const repo = createSubscriptionRepositoryMock({
      getByUserId: jest.fn<Promise<Subscription | null>, [string]>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    await expect(
      getUserSubscription(repo, {
        userId: "223e4567-e89b-12d3-a456-426614174000",
      })
    ).rejects.toThrow(repositoryError);
  });
});

import { z } from "zod";

import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";

const AvatarOwnerIdSchema = z.string().uuid();

export const removeAvatar = async (
  gateway: AccountGateway,
  userId: string
): Promise<void> => {
  AvatarOwnerIdSchema.parse(userId);
  return gateway.deleteAvatar(userId);
};

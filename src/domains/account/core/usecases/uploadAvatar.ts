import { z } from "zod";

import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";

const AvatarOwnerIdSchema = z.string().uuid();

export const uploadAvatar = async (
  gateway: AccountGateway,
  userId: string,
  file: File
): Promise<string> => {
  AvatarOwnerIdSchema.parse(userId);
  return gateway.uploadAvatar(userId, file);
};

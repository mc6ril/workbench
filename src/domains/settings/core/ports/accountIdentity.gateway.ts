export type AccountIdentityGateway = {
  updateDisplayName(userId: string, displayName: string): Promise<void>;
  updateEmail(email: string): Promise<void>;
};

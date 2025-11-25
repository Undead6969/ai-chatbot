import type { UserType } from "@/app/(auth)/auth";
import { chatModels } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: string[];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: chatModels.map((m) => m.id), // All models available
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: chatModels.map((m) => m.id), // All models available
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};

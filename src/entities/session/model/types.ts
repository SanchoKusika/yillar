import type { Era } from "@shared/lib";

export type Profile = {
  id: string;
  username: string | null;
  displayName: string | null;
  generation: Era | null;
  avatarUrl: string | null;
};

export type AuthUserSummary = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};

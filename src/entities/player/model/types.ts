import type { Era } from "@shared/lib";

export type Player = {
  id: string;
  name: string;
  era: Era | null;
};

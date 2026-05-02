import type { Era } from "@shared/lib";

export type Track = {
  id: string;
  youtubeId: string;
  artist: string;
  title: string;
  year: number;
  era: Era;
};

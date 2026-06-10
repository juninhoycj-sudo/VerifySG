import { CommunityAlert, Circle } from "./types";

export const COMMUNITY_ALERTS: CommunityAlert[] = [];

export const INITIAL_CIRCLES: Circle[] = [
  { id: 1, name: "Family", members: 5, avatar: "👨‍👩‍👧‍👦", alerts: 2 },
  { id: 2, name: "NS Mates", members: 12, avatar: "🪖", alerts: 0 },
  { id: 3, name: "NUS CS Classmates", members: 28, avatar: "🎓", alerts: 1 },
];

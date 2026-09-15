import { describe, expect, it } from "vitest";
import { FriendRequest, splitRequests } from "./social";

describe("splitRequests", () => {
  it("separates incoming and outgoing requests", () => {
    const profile = { userId: "2", username: "friend", displayName: "Friend", bio: null, relationship: "incoming" as const };
    const requests: FriendRequest[] = [
      { id: "1", profile, direction: "incoming", createdAt: "2026-09-15" },
      { id: "2", profile: { ...profile, relationship: "outgoing" }, direction: "outgoing", createdAt: "2026-09-15" },
    ];
    expect(splitRequests(requests).incoming).toHaveLength(1);
    expect(splitRequests(requests).outgoing).toHaveLength(1);
  });
});

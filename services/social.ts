export type Relationship = "none" | "outgoing" | "incoming" | "friends";
export type SocialProfile = { userId: string; username: string; displayName: string; bio: string | null; relationship: Relationship };
export type FriendRequest = { id: string; profile: SocialProfile; direction: "incoming" | "outgoing"; createdAt: string };

export function splitRequests(requests: FriendRequest[]) {
  return {
    incoming: requests.filter((item) => item.direction === "incoming"),
    outgoing: requests.filter((item) => item.direction === "outgoing"),
  };
}

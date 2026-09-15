export type PublicProfile = { username: string; displayName: string; bio: string | null; updatedAt: string };
export type PublicProfileInput = Pick<PublicProfile, "username" | "displayName" | "bio">;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidPublicProfile(value: PublicProfileInput) {
  return /^[a-z0-9_]{3,20}$/.test(value.username)
    && value.displayName.trim().length >= 2
    && value.displayName.trim().length <= 40
    && (value.bio?.trim().length ?? 0) <= 160;
}

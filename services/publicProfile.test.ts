import { describe, expect, it } from "vitest";
import { isValidPublicProfile, normalizeUsername } from "./publicProfile";

describe("public profile", () => {
  it("normalizes usernames", () => expect(normalizeUsername(" Water.Ly_1 ")).toBe("waterly_1"));
  it("validates public fields", () => {
    expect(isValidPublicProfile({ username: "water_1", displayName: "Water", bio: null })).toBe(true);
    expect(isValidPublicProfile({ username: "ab", displayName: "W", bio: null })).toBe(false);
  });
});

import { describe,expect,it } from "vitest";
import { parseGroupInviteToken } from "./inviteLinks";

describe("group invite links",()=>{
  const token="a".repeat(64);
  it("reads custom-scheme and web links",()=>{
    expect(parseGroupInviteToken(`water://invite/group/${token}`)).toBe(token);
    expect(parseGroupInviteToken(`https://waterly.example/invite/group/${token}`)).toBe(token);
  });
  it("rejects malformed tokens",()=>expect(parseGroupInviteToken("water://invite/group/short")).toBeNull());
});

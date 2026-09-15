import { describe,expect,it } from "vitest";
import { availableFriends } from "./groups";
describe("availableFriends",()=>{it("excludes current members",()=>{const friends=[{userId:"1"},{userId:"2"}];const members=[{userId:"1",username:"one",displayName:"One",role:"member" as const,joinedAt:"now"}];expect(availableFriends(friends,members)).toEqual([{userId:"2"}]);});});

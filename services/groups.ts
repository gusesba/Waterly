export type GroupSummary = { id:string; name:string; description:string|null; isOwner:boolean; memberCount:number; updatedAt:string };
export type GroupMember = { userId:string; username:string; displayName:string; role:"owner"|"member"; joinedAt:string };
export type GroupDetail = { id:string; name:string; description:string|null; isOwner:boolean; members:GroupMember[]; updatedAt:string };
export type GroupCapacity = { used:number; limit:number };
export type GroupInvite = { token:string; expiresAt:string };
export type GroupInvitePreview = { groupId:string; groupName:string; ownerDisplayName:string; memberCount:number; expiresAt:string; isMember:boolean };
export type SaveGroup = { name:string; description:string|null };
export function availableFriends<T extends { userId:string }>(friends:T[], members:GroupMember[]) { const ids=new Set(members.map(item=>item.userId)); return friends.filter(item=>!ids.has(item.userId)); }

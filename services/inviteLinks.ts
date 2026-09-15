import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = "waterly:pending-group-invite";

export function parseGroupInviteToken(url: string | null | undefined) {
  const match = url?.match(/(?:^|\/)invite\/group\/([a-f\d]{64})(?:[/?#]|$)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export const loadPendingGroupInvite = () => AsyncStorage.getItem(storageKey);
export const savePendingGroupInvite = (token: string) => AsyncStorage.setItem(storageKey, token);
export const clearPendingGroupInvite = () => AsyncStorage.removeItem(storageKey);

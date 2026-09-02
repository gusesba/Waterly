import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { SessionTokens } from "./api";

const SESSION_STORAGE_KEY = "@waterly/session";

export async function loadSession(): Promise<SessionTokens | null> {
  try {
    const value = Platform.OS === "web"
      ? globalThis.sessionStorage?.getItem(SESSION_STORAGE_KEY) ?? null
      : await SecureStore.getItemAsync(SESSION_STORAGE_KEY);

    return value ? JSON.parse(value) as SessionTokens : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: SessionTokens) {
  const value = JSON.stringify(session);

  if (Platform.OS === "web") {
    globalThis.sessionStorage?.setItem(SESSION_STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, value);
}

export async function clearSession() {
  if (Platform.OS === "web") {
    globalThis.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

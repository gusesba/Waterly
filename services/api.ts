import { Platform } from "react-native";

import type { GoalId } from "../constants/labels";

const defaultApiUrl = Platform.OS === "android"
  ? "http://10.0.2.2:5004"
  : "http://localhost:5004";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;

export type SessionTokens = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

export type CurrentUser = {
  email: string;
  hasCompletedOnboarding: boolean;
  profile: {
    age: number;
    goals: GoalId[];
    heightCm: number;
    weightKg: number;
  } | null;
  hydrationGoal: {
    dailyTargetMl: number;
    effectiveFrom: string;
    timeZone: string;
  } | null;
};

export type OnboardingPayload = {
  age: number;
  dailyTargetMl: number;
  goals: GoalId[];
  heightCm: number;
  timeZone: string;
  weightKg: number;
};

type TokenResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export async function registerAccount(email: string, password: string) {
  await request("/api/v1/auth/register", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
}

export async function loginAccount(email: string, password: string) {
  const response = await request<TokenResponse>(
    "/api/v1/auth/login?useCookies=false",
    {
      body: JSON.stringify({ email, password }),
      method: "POST",
    },
  );

  return mapTokens(response);
}

export async function refreshSession(refreshToken: string) {
  const response = await request<TokenResponse>("/api/v1/auth/refresh", {
    body: JSON.stringify({ refreshToken }),
    method: "POST",
  });

  return mapTokens(response);
}

export function getCurrentUser(accessToken: string, language: string) {
  return request<CurrentUser>("/api/v1/me", {}, accessToken, language);
}

export function syncOnboarding(
  accessToken: string,
  language: string,
  payload: OnboardingPayload,
) {
  return request<CurrentUser>(
    "/api/v1/me/onboarding",
    {
      body: JSON.stringify(payload),
      method: "PUT",
    },
    accessToken,
    language,
  );
}

export async function apiRequest<T = void>(
  path: string,
  init: RequestInit,
  accessToken?: string,
  language = "pt-BR",
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Accept-Language": language,
        "Content-Type": "application/json",
        "X-Correlation-ID": createCorrelationId(),
        ...init.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      signal: controller.signal,
    });
    const body = await readBody(response);

    if (!response.ok) {
      throw new ApiError(response.status, body);
    }

    return body as T;
  } finally {
    clearTimeout(timeout);
  }
}

const request = apiRequest;

async function readBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function mapTokens(response: TokenResponse): SessionTokens {
  return {
    accessToken: response.accessToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
    refreshToken: response.refreshToken,
  };
}

function createCorrelationId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

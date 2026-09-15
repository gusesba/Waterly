import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { ApiError } from "../services/api";
import {
  HydrationOperation,
  NewHydrationOperation,
  enqueueHydrationOperation,
  hydrationOperationEntryId,
  loadHydrationQueue,
  retryFailedOperations,
  saveHydrationQueue,
} from "../services/hydrationQueue";
import { useAuth } from "./AuthProvider";

type SyncContextValue = {
  discardFailed: () => Promise<void>;
  enqueue: (operation: NewHydrationOperation) => Promise<void>;
  failedCount: number;
  failedEntryIds: string[];
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingEntryIds: string[];
  retry: () => Promise<void>;
};

const HydrationSyncContext = createContext<SyncContextValue | null>(null);

export function HydrationSyncProvider({ children }: { children: ReactNode }) {
  const { request, user } = useAuth();
  const queryClient = useQueryClient();
  const [operations, setOperations] = useState<HydrationOperation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const operationsRef = useRef(operations);
  const flushPromiseRef = useRef<Promise<void> | null>(null);
  operationsRef.current = operations;

  useEffect(() => NetInfo.addEventListener((state) => {
    setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
  }), []);

  useEffect(() => {
    if (!user) {
      setOperations([]);
      return;
    }

    void loadHydrationQueue(user.email).then(setOperations);
  }, [user]);

  const persist = useCallback(async (next: HydrationOperation[]) => {
    if (!user) return;
    operationsRef.current = next;
    setOperations(next);
    await saveHydrationQueue(user.email, next);
  }, [user]);

  async function enqueue(operation: NewHydrationOperation) {
    await persist(enqueueHydrationOperation(operationsRef.current, operation));
  }

  const flush = useCallback(async () => {
    if (!user || !isOnline || flushPromiseRef.current) return flushPromiseRef.current ?? undefined;

    const work = async () => {
      const now = Date.now();
      if (!operationsRef.current.some((operation) =>
        operation.status === "pending" && (operation.nextAttemptAt ?? 0) <= now)) return;

      setIsSyncing(true);

      try {
        while (true) {
          const index = operationsRef.current.findIndex((operation) =>
            operation.status === "pending" && (operation.nextAttemptAt ?? 0) <= Date.now());
          if (index < 0) break;

          const operation = operationsRef.current[index];
          try {
            await sendOperation(operation);
            await persist(operationsRef.current.filter((item) => item.id !== operation.id));
          } catch (error) {
            const permanent = error instanceof ApiError &&
              error.status >= 400 && error.status < 500 && error.status !== 429;
            const attempts = operation.attempts + 1;
            const next = operationsRef.current.map((item) => item.id === operation.id
              ? {
                  ...item,
                  attempts,
                  lastError: describeError(error),
                  nextAttemptAt: permanent
                    ? null
                    : Date.now() + retryDelay(attempts, error),
                  status: permanent ? "failed" as const : "pending" as const,
                }
              : item);
            await persist(next);
          }
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["hydration", "today"] }),
          queryClient.invalidateQueries({ queryKey: ["hydration", "history"] }),
          queryClient.invalidateQueries({ queryKey: ["hydration", "suggestions"] }),
        queryClient.invalidateQueries({ queryKey: ["hydration", "beverages"] }),
        queryClient.invalidateQueries({ queryKey: ["habits", "streak"] }),
        queryClient.invalidateQueries({ queryKey: ["habits", "achievements"] }),
        ]);
      } finally {
        setIsSyncing(false);
      }
    };

    flushPromiseRef.current = work().finally(() => {
      flushPromiseRef.current = null;
    });
    return flushPromiseRef.current;
  }, [isOnline, persist, queryClient, request, user]);

  async function sendOperation(operation: HydrationOperation) {
    if (operation.type === "create") {
      await request("/api/v1/hydration/entries", {
        body: JSON.stringify(operation.payload),
        method: "POST",
      });
    } else if (operation.type === "update") {
      await request(`/api/v1/hydration/entries/${operation.entryId}`, {
        body: JSON.stringify({ ...operation.payload, clientOperationId: operation.id }),
        method: "PATCH",
      });
    } else {
      await request(
        `/api/v1/hydration/entries/${operation.entryId}?clientOperationId=${operation.id}`,
        { method: "DELETE" },
      );
    }
  }

  useEffect(() => {
    if (isOnline && operations.length > 0) void flush();
  }, [flush, isOnline, operations]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void flush();
    });
    return () => subscription.remove();
  }, [flush]);

  useEffect(() => {
    if (!isOnline) return;
    const nextAttemptAt = operations
      .filter((operation) => operation.status === "pending" && operation.nextAttemptAt)
      .reduce<number | null>((nearest, operation) =>
        nearest === null || operation.nextAttemptAt! < nearest ? operation.nextAttemptAt! : nearest,
      null);
    if (nextAttemptAt === null) return;
    const timer = setTimeout(() => void flush(), Math.max(nextAttemptAt - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [flush, isOnline, operations]);

  async function retry() {
    await persist(retryFailedOperations(operationsRef.current));
    await flush();
  }

  async function discardFailed() {
    await persist(operationsRef.current.filter((operation) => operation.status !== "failed"));
  }

  return (
    <HydrationSyncContext.Provider value={{
      discardFailed,
      enqueue,
      failedCount: operations.filter((operation) => operation.status === "failed").length,
      failedEntryIds: operations
        .filter((operation) => operation.status === "failed")
        .map(hydrationOperationEntryId),
      isOnline,
      isSyncing,
      pendingCount: operations.filter((operation) => operation.status === "pending").length,
      pendingEntryIds: operations
        .filter((operation) => operation.status === "pending")
        .map(hydrationOperationEntryId),
      retry,
    }}>
      {children}
    </HydrationSyncContext.Provider>
  );
}

function retryDelay(attempts: number, error: unknown) {
  const base = Math.min(1_000 * 2 ** (attempts - 1), 60_000);
  if (error instanceof ApiError && error.retryAfterMs !== undefined) {
    return Math.max(error.retryAfterMs, base);
  }
  return base + Math.floor(Math.random() * Math.max(Math.floor(base * 0.25), 1));
}

function describeError(error: unknown) {
  if (error instanceof ApiError) return `HTTP ${error.status}`;
  return error instanceof Error ? error.message : "Unknown synchronization error";
}

export function useHydrationSync() {
  const context = useContext(HydrationSyncContext);
  if (!context) throw new Error("useHydrationSync must be used inside HydrationSyncProvider");
  return context;
}

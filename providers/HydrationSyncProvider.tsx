import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { ApiError } from "../services/api";
import {
  HydrationOperation,
  loadHydrationQueue,
  saveHydrationQueue,
} from "../services/hydrationQueue";
import { useAuth } from "./AuthProvider";

type SyncContextValue = {
  enqueue: (operation: HydrationOperation) => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
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

  async function persist(next: HydrationOperation[]) {
    if (!user) return;
    operationsRef.current = next;
    setOperations(next);
    await saveHydrationQueue(user.email, next);
  }

  async function enqueue(operation: HydrationOperation) {
    await persist([...operationsRef.current, operation]);
  }

  async function flush() {
    if (!user || !isOnline || isSyncing || operationsRef.current.length === 0) return;
    setIsSyncing(true);

    try {
      while (operationsRef.current.length > 0) {
        const operation = operationsRef.current[0];
        await sendOperation(operation);
        await persist(operationsRef.current.slice(1));
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["hydration", "today"] }),
        queryClient.invalidateQueries({ queryKey: ["hydration", "history"] }),
        queryClient.invalidateQueries({ queryKey: ["hydration", "suggestions"] }),
        queryClient.invalidateQueries({ queryKey: ["hydration", "beverages"] }),
      ]);
    } catch (error) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        return;
      }
    } finally {
      setIsSyncing(false);
    }
  }

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
  }, [isOnline, operations.length, user]);

  return (
    <HydrationSyncContext.Provider value={{
      enqueue,
      isOnline,
      isSyncing,
      pendingCount: operations.length,
      retry: flush,
    }}>
      {children}
    </HydrationSyncContext.Provider>
  );
}

export function useHydrationSync() {
  const context = useContext(HydrationSyncContext);
  if (!context) throw new Error("useHydrationSync must be used inside HydrationSyncProvider");
  return context;
}

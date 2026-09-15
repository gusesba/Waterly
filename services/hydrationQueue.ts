import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AddEntryCommand } from "./hydration";

export type NewHydrationOperation =
  | { id: string; type: "create"; payload: AddEntryCommand }
  | {
      id: string;
      type: "update";
      entryId: string;
      payload: { beverageCode: string; volumeMl: number };
    }
  | { id: string; type: "delete"; entryId: string };

export type HydrationOperation = NewHydrationOperation & {
  attempts: number;
  lastError: string | null;
  nextAttemptAt: number | null;
  status: "failed" | "pending";
};

const VERSION = 2;

function storageKey(account: string) {
  return `@waterly/hydration-queue/${account.toLowerCase()}`;
}

export async function loadHydrationQueue(account: string): Promise<HydrationOperation[]> {
  try {
    const value = await AsyncStorage.getItem(storageKey(account));
    if (!value) return [];
    const parsed = JSON.parse(value) as {
      operations?: (HydrationOperation | NewHydrationOperation)[];
      version?: number;
    };
    if (!Array.isArray(parsed.operations) || ![1, VERSION].includes(parsed.version ?? 0)) {
      return [];
    }

    return parsed.operations.map((operation) => ({
      ...operation,
      attempts: "attempts" in operation ? operation.attempts : 0,
      lastError: "lastError" in operation ? operation.lastError : null,
      nextAttemptAt: "nextAttemptAt" in operation ? operation.nextAttemptAt : null,
      status: "status" in operation && operation.status === "failed" ? "failed" : "pending",
    }));
  } catch {
    return [];
  }
}

export function enqueueHydrationOperation(
  operations: HydrationOperation[],
  incoming: NewHydrationOperation,
): HydrationOperation[] {
  const entryId = hydrationOperationEntryId(incoming);
  const related = operations.filter((operation) => hydrationOperationEntryId(operation) === entryId);
  const pendingCreate = related.find((operation) => operation.type === "create");

  if (incoming.type === "update" && pendingCreate?.type === "create") {
    return operations.map((operation) => operation.id === pendingCreate.id
      ? toPending({
          ...pendingCreate,
          payload: {
            ...pendingCreate.payload,
            beverageCode: incoming.payload.beverageCode,
            volumeMl: incoming.payload.volumeMl,
          },
        })
      : operation);
  }

  if (incoming.type === "delete" && pendingCreate) {
    return operations.filter((operation) => hydrationOperationEntryId(operation) !== entryId);
  }

  const withoutSuperseded = incoming.type === "update" || incoming.type === "delete"
    ? operations.filter((operation) =>
        hydrationOperationEntryId(operation) !== entryId || operation.type !== "update")
    : operations;

  return [...withoutSuperseded, toPending(incoming)];
}

export function retryFailedOperations(operations: HydrationOperation[]) {
  return operations.map((operation) => operation.status === "failed"
    ? toPending(operation)
    : operation);
}

function toPending(operation: NewHydrationOperation | HydrationOperation): HydrationOperation {
  return {
    ...operation,
    attempts: 0,
    lastError: null,
    nextAttemptAt: null,
    status: "pending",
  };
}

export function hydrationOperationEntryId(
  operation: NewHydrationOperation | HydrationOperation,
) {
  return operation.type === "create" ? operation.payload.clientEntryId : operation.entryId;
}

export async function saveHydrationQueue(
  account: string,
  operations: HydrationOperation[],
) {
  await AsyncStorage.setItem(storageKey(account), JSON.stringify({ operations, version: VERSION }));
}

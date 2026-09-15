import { describe, expect, it } from "vitest";

import {
  enqueueHydrationOperation,
  type HydrationOperation,
  retryFailedOperations,
} from "./hydrationQueue";

const create: HydrationOperation = {
  attempts: 0,
  id: "entry-1",
  lastError: null,
  nextAttemptAt: null,
  payload: {
    beverageCode: "water",
    clientEntryId: "entry-1",
    occurredAt: "2026-09-15T12:00:00.000Z",
    timeZone: "America/Sao_Paulo",
    volumeMl: 250,
  },
  status: "pending",
  type: "create",
};

describe("enqueueHydrationOperation", () => {
  it("merges an update into a pending create", () => {
    const result = enqueueHydrationOperation([create], {
      entryId: "entry-1",
      id: "operation-2",
      payload: { beverageCode: "coffee", volumeMl: 500 },
      type: "update",
    });

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("create");
    expect(result[0].type === "create" && result[0].payload).toMatchObject({
      beverageCode: "coffee",
      clientEntryId: "entry-1",
      volumeMl: 500,
    });
  });

  it("removes a create that is deleted before synchronization", () => {
    expect(enqueueHydrationOperation([create], {
      entryId: "entry-1",
      id: "operation-2",
      type: "delete",
    })).toEqual([]);
  });

  it("keeps only the latest update for an existing server entry", () => {
    const first = enqueueHydrationOperation([], {
      entryId: "server-entry",
      id: "operation-1",
      payload: { beverageCode: "tea", volumeMl: 250 },
      type: "update",
    });
    const result = enqueueHydrationOperation(first, {
      entryId: "server-entry",
      id: "operation-2",
      payload: { beverageCode: "tea", volumeMl: 350 },
      type: "update",
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "operation-2", payload: { volumeMl: 350 } });
  });
});

describe("retryFailedOperations", () => {
  it("clears failure metadata while preserving the operation", () => {
    const result = retryFailedOperations([{
      ...create,
      attempts: 3,
      lastError: "HTTP 400",
      status: "failed",
    }]);

    expect(result[0]).toMatchObject({
      attempts: 0,
      lastError: null,
      nextAttemptAt: null,
      status: "pending",
    });
  });
});

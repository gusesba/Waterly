import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { useHydrationSync } from "../../providers/HydrationSyncProvider";
import { formatLiters } from "../../screens/onboarding/utils";
import { ApiError } from "../../services/api";
import type {
  AddEntryCommand,
  Beverage,
  QuickAddSuggestion,
  TodayHydration,
} from "../../services/hydration";
import { loadHydrationSnapshot, saveHydrationSnapshot } from "../../services/hydrationSnapshot";

type AddEntryContext = {
  previous?: TodayHydration;
};

export default function HomeRoute() {
  const { copy, language } = useAppLabels();
  const { logout, request, user } = useAuth();
  const {
    discardFailed,
    enqueue,
    failedCount,
    failedEntryIds,
    isOnline,
    isSyncing,
    pendingCount,
    pendingEntryIds,
    retry,
  } = useHydrationSync();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [amountInput, setAmountInput] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [selectedBeverage, setSelectedBeverage] = useState("water");
  const queryKey = ["hydration", "today", user?.email];
  const todayQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<TodayHydration>("/api/v1/hydration/today"),
    queryKey,
  });
  const beveragesQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<Beverage[]>("/api/v1/hydration/beverages"),
    queryKey: ["hydration", "beverages"],
    staleTime: 5 * 60_000,
  });
  const suggestionsQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<QuickAddSuggestion[]>(
      `/api/v1/hydration/suggestions?beverageCode=${encodeURIComponent(selectedBeverage)}`,
    ),
    queryKey: ["hydration", "suggestions", user?.email, selectedBeverage],
  });
  useEffect(() => {
    if (!user) return;
    void loadHydrationSnapshot(user.email).then((snapshot) => {
      const snapshotQueryKey = ["hydration", "today", user.email];
      if (snapshot && !queryClient.getQueryData(snapshotQueryKey)) {
        queryClient.setQueryData(snapshotQueryKey, snapshot);
      }
    });
  }, [queryClient, user]);

  useEffect(() => {
    if (user && todayQuery.data) {
      void saveHydrationSnapshot(user.email, todayQuery.data);
    }
  }, [todayQuery.data, user]);
  const addEntry = useMutation<TodayHydration, Error, AddEntryCommand, AddEntryContext>({
    mutationFn: (command: AddEntryCommand) => request<TodayHydration>(
      "/api/v1/hydration/entries",
      {
        body: JSON.stringify(command),
        method: "POST",
      },
    ),
    onError: async (error, command, context) => {
      if (isRetryable(error)) {
        await enqueue({ id: command.clientEntryId, payload: command, type: "create" });
        return;
      }
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodayHydration>(queryKey);

      if (previous) {
        const factor = beveragesQuery.data?.find(
          (beverage) => beverage.code === command.beverageCode,
        )?.hydrationFactor ?? 1;
        const hydrationMl = Math.round(command.volumeMl * factor);
        const consumedMl = previous.consumedMl + hydrationMl;
        queryClient.setQueryData<TodayHydration>(queryKey, {
          ...previous,
          consumedMl,
          entries: [{
            ...command,
            hydrationMl,
            id: command.clientEntryId,
            source: "manual",
          }, ...previous.entries],
          progress: Math.min(consumedMl / previous.dailyTargetMl, 1),
        });
      }

      return { previous };
    },
    onSuccess: (hydration) => {
      queryClient.setQueryData(queryKey, hydration);
      void queryClient.invalidateQueries({ queryKey: ["hydration", "history"] });
      void queryClient.invalidateQueries({ queryKey: ["hydration", "suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["hydration", "beverages"] });
    },
  });
  const changeEntry = useMutation<
    TodayHydration,
    Error,
    {
      beverageCode?: string;
      entryId: string;
      id: string;
      method: "DELETE" | "PATCH";
      volumeMl?: number;
    },
    AddEntryContext
  >({
    mutationFn: ({ beverageCode, entryId, id, method, volumeMl }) => request<TodayHydration>(
      `/api/v1/hydration/entries/${entryId}${
        method === "DELETE" ? `?clientOperationId=${id}` : ""
      }`,
      {
        body: method === "PATCH"
          ? JSON.stringify({ beverageCode, clientOperationId: id, volumeMl })
          : undefined,
        method,
      },
    ),
    onMutate: async (operation) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodayHydration>(queryKey);
      if (!previous) return { previous };
      const currentEntry = previous.entries.find((entry) => entry.id === operation.entryId);
      if (!currentEntry) return { previous };

      if (operation.method === "DELETE") {
        const consumedMl = previous.consumedMl - currentEntry.hydrationMl;
        queryClient.setQueryData<TodayHydration>(queryKey, {
          ...previous,
          consumedMl,
          entries: previous.entries.filter((entry) => entry.id !== operation.entryId),
          progress: Math.min(consumedMl / previous.dailyTargetMl, 1),
        });
      } else {
        const factor = beveragesQuery.data?.find(
          (beverage) => beverage.code === operation.beverageCode,
        )?.hydrationFactor ?? 1;
        const hydrationMl = Math.round((operation.volumeMl ?? 0) * factor);
        const consumedMl = previous.consumedMl - currentEntry.hydrationMl + hydrationMl;
        queryClient.setQueryData<TodayHydration>(queryKey, {
          ...previous,
          consumedMl,
          entries: previous.entries.map((entry) => entry.id === operation.entryId
            ? {
                ...entry,
                beverageCode: operation.beverageCode ?? entry.beverageCode,
                hydrationMl,
                volumeMl: operation.volumeMl ?? entry.volumeMl,
              }
            : entry),
          progress: Math.min(consumedMl / previous.dailyTargetMl, 1),
        });
      }
      return { previous };
    },
    onError: async (error, operation, context) => {
      if (isRetryable(error)) {
        await enqueue(operation.method === "PATCH"
          ? {
              entryId: operation.entryId,
              id: operation.id,
              payload: {
                beverageCode: operation.beverageCode ?? "water",
                volumeMl: operation.volumeMl ?? 0,
              },
              type: "update",
            }
          : { entryId: operation.entryId, id: operation.id, type: "delete" });
        setAmountInput("");
        setEditingEntryId(null);
        return;
      }
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (nextHydration) => {
      queryClient.setQueryData(queryKey, nextHydration);
      void queryClient.invalidateQueries({ queryKey: ["hydration", "history"] });
      void queryClient.invalidateQueries({ queryKey: ["hydration", "suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["hydration", "beverages"] });
      setAmountInput("");
      setEditingEntryId(null);
    },
  });

  function logWater(volumeMl: number, beverageCode = selectedBeverage) {
    addEntry.mutate({
      clientEntryId: Crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      volumeMl,
      beverageCode,
    });
  }

  function submitAmount() {
    const volumeMl = Number(amountInput);

    if (!Number.isInteger(volumeMl) || volumeMl < 1 || volumeMl > 2000) {
      return;
    }

    if (editingEntryId) {
      changeEntry.mutate({
        beverageCode: selectedBeverage,
        entryId: editingEntryId,
        id: Crypto.randomUUID(),
        method: "PATCH",
        volumeMl,
      });
      return;
    }

    logWater(volumeMl);
    setAmountInput("");
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestScreen}>
          <View style={styles.brandMark}>
            <Ionicons color={COLORS.surface} name="water" size={24} />
          </View>
          <Text style={styles.title}>{copy.home.accountRequiredTitle}</Text>
          <Text style={styles.description}>{copy.home.accountRequiredDescription}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("./account")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonLabel}>{copy.auth.createAccount}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hydration = todayQuery.data;
  const defaultSuggestions = [
    { beverageCode: selectedBeverage, volumeMl: 250 },
    { beverageCode: selectedBeverage, volumeMl: 350 },
    { beverageCode: selectedBeverage, volumeMl: 500 },
  ];
  const selectedSuggestions = suggestionsQuery.data?.filter(
    (suggestion) => suggestion.beverageCode === selectedBeverage,
  );
  const suggestions = selectedSuggestions?.length === 3
    ? selectedSuggestions
    : defaultSuggestions;
  const selectedBeverageName = copy.home.beverageNames[selectedBeverage]
    ?? selectedBeverage;
  const progress = hydration?.progress ?? 0;
  const progressWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>{copy.home.eyebrow}</Text>
        <Text style={styles.title}>{copy.home.title}</Text>
        <Text style={styles.description}>{copy.home.description}</Text>

        {(!isOnline || pendingCount > 0 || failedCount > 0 || isSyncing) && (
          <View style={styles.syncStatus}>
            <Text style={styles.syncText}>
              {!isOnline
                ? copy.home.offline
                : failedCount > 0
                  ? copy.home.failedSync(failedCount)
                : isSyncing
                  ? copy.home.syncing
                  : copy.home.pendingSync(pendingCount)}
            </Text>
            {isOnline && failedCount > 0 && !isSyncing && (
              <View>
                <Pressable accessibilityRole="button" onPress={() => void retry()}>
                  <Text style={styles.syncAction}>{copy.home.retrySync}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => void discardFailed()}>
                  <Text style={styles.syncAction}>{copy.home.discardFailed}</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {todayQuery.isPending ? (
          <View style={styles.status}>
            <ActivityIndicator color={COLORS.blueDark} />
            <Text style={styles.statusText}>{copy.home.loading}</Text>
          </View>
        ) : !hydration ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {copy.home.loadError}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void todayQuery.refetch()}>
              <Text style={styles.link}>{copy.home.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.progressCard}>
              <View style={styles.metricsRow}>
                <View>
                  <Text style={styles.metricLabel}>{copy.home.consumed}</Text>
                  <Text style={styles.metricValue}>
                    {formatAmount(hydration.consumedMl, language, copy.target.milliliters)}
                  </Text>
                </View>
                <View style={styles.metricRight}>
                  <Text style={styles.metricLabel}>{copy.home.dailyTarget}</Text>
                  <Text style={styles.metricTarget}>
                    {formatLiters(hydration.dailyTargetMl, language, copy.target.liters)}
                  </Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              <Text style={styles.percentage}>
                {Math.round(progress * 100).toLocaleString(language)}%
              </Text>
            </View>

            <Text style={styles.sectionLabel}>{copy.home.beverage}</Text>
            <ScrollView
              contentContainerStyle={styles.beverageRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {(beveragesQuery.data ?? []).map((beverage) => (
                <Pressable
                  accessibilityRole="button"
                  key={beverage.code}
                  onPress={() => setSelectedBeverage(beverage.code)}
                  style={[
                    styles.beverageButton,
                    selectedBeverage === beverage.code && styles.beverageButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.beverageLabel,
                    selectedBeverage === beverage.code && styles.beverageLabelSelected,
                  ]}>
                    {copy.home.beverageNames[beverage.code] ?? beverage.code}
                  </Text>
                  <Text style={[
                    styles.beveragePercentage,
                    selectedBeverage === beverage.code && styles.beverageLabelSelected,
                  ]}>
                    {copy.home.waterPercentage(Math.round(beverage.hydrationFactor * 100))}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>
              {copy.home.quickAddFor(selectedBeverageName)}
            </Text>
            <View style={styles.quickRow}>
              {suggestions.map((suggestion) => {
                const amount = suggestion.volumeMl;
                const hydrationFactor = beveragesQuery.data?.find(
                  (beverage) => beverage.code === suggestion.beverageCode,
                )?.hydrationFactor ?? 1;
                const equivalentWater = Math.round(amount * hydrationFactor);
                const formattedAmount = formatAmount(
                  amount,
                  language,
                  copy.target.milliliters,
                );

                return (
                  <Pressable
                    accessibilityLabel={copy.home.addAmount(formattedAmount)}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: addEntry.isPending }}
                    disabled={addEntry.isPending}
                    key={`${suggestion.beverageCode}-${amount}`}
                    onPress={() => {
                      setSelectedBeverage(suggestion.beverageCode);
                      logWater(amount, suggestion.beverageCode);
                    }}
                    style={({ pressed }) => [
                      styles.quickButton,
                      pressed && styles.pressed,
                      addEntry.isPending && styles.disabled,
                    ]}
                  >
                    <Ionicons color={COLORS.blueDark} name="add" size={19} />
                    <View>
                      <Text style={styles.quickLabel}>{formattedAmount}</Text>
                      <Text style={styles.quickBeverage}>
                        {copy.home.beverageNames[suggestion.beverageCode]
                          ?? suggestion.beverageCode}
                      </Text>
                      {equivalentWater !== amount && (
                        <Text style={styles.quickEquivalent}>
                          {copy.home.waterEquivalentShort(formatAmount(
                            equivalentWater,
                            language,
                            copy.target.milliliters,
                          ))}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.sectionLabel}>{copy.home.customAmount}</Text>
            <View style={styles.customRow}>
              <TextInput
                accessibilityLabel={copy.home.customPlaceholder}
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={setAmountInput}
                placeholder={copy.home.customPlaceholder}
                placeholderTextColor={COLORS.muted}
                style={styles.amountInput}
                value={amountInput}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!amountInput || addEntry.isPending || changeEntry.isPending}
                onPress={submitAmount}
                style={({ pressed }) => [styles.compactButton, pressed && styles.pressed]}
              >
                <Text style={styles.compactButtonLabel}>
                  {editingEntryId ? copy.home.save : copy.home.addCustom}
                </Text>
              </Pressable>
              {editingEntryId && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setEditingEntryId(null);
                    setAmountInput("");
                  }}
                >
                  <Text style={styles.link}>{copy.home.cancel}</Text>
                </Pressable>
              )}
            </View>
            {addEntry.isError && pendingCount === 0 && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {copy.home.addError}
              </Text>
            )}
            {changeEntry.isError && pendingCount === 0 && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {copy.home.changeError}
              </Text>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{copy.home.todayEntries}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push("./history")}>
                <Text style={styles.link}>{copy.home.history}</Text>
              </Pressable>
            </View>
            {hydration.entries.length === 0 ? (
              <Text style={styles.emptyText}>{copy.home.noEntries}</Text>
            ) : hydration.entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View>
                  <Text style={styles.entryAmount}>
                    {formatAmount(entry.volumeMl, language, copy.target.milliliters)}
                  </Text>
                  <Text style={styles.entryTime}>
                    {copy.home.beverageNames[entry.beverageCode] ?? entry.beverageCode} ·{" "}
                    {new Date(entry.occurredAt).toLocaleTimeString(language, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {entry.hydrationMl !== entry.volumeMl && (
                    <Text style={styles.entryEquivalent}>
                      {copy.home.waterEquivalent(formatAmount(
                        entry.hydrationMl,
                        language,
                        copy.target.milliliters,
                      ))}
                    </Text>
                  )}
                  {failedEntryIds.includes(entry.id) ? (
                    <Text style={styles.entrySyncError}>{copy.home.entrySyncFailed}</Text>
                  ) : pendingEntryIds.includes(entry.id) ? (
                    <Text style={styles.entrySyncPending}>{copy.home.entrySyncPending}</Text>
                  ) : null}
                </View>
                <View style={styles.entryActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setEditingEntryId(entry.id);
                      setAmountInput(String(entry.volumeMl));
                      setSelectedBeverage(entry.beverageCode);
                    }}
                  >
                    <Text style={styles.link}>{copy.home.edit}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={changeEntry.isPending}
                    onPress={() => changeEntry.mutate({
                      entryId: entry.id,
                      id: Crypto.randomUUID(),
                      method: "DELETE",
                    })}
                  >
                    <Text style={styles.removeLink}>{copy.home.remove}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.accountArea}>
          <Text style={styles.account}>{copy.home.signedInAs(user.email)}</Text>
          <Pressable accessibilityRole="button" onPress={() => void logout()}>
            <Text style={styles.link}>{copy.auth.logout}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatAmount(value: number, locale: string, unit: string) {
  return `${value.toLocaleString(locale)} ${unit}`;
}

function isRetryable(error: Error) {
  return !(error instanceof ApiError) || error.status === 429 || error.status >= 500;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 44,
  },
  guestScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: 22,
    height: 56,
    justifyContent: "center",
    marginBottom: 22,
    width: 56,
  },
  eyebrow: {
    color: COLORS.blueDark,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 39,
    marginTop: 10,
    textAlign: "center",
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  syncStatus: {
    alignItems: "center",
    backgroundColor: COLORS.blueSoft,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  syncText: {
    color: COLORS.blueDark,
    fontSize: 12,
    fontWeight: "700",
  },
  syncAction: {
    color: COLORS.blueDark,
    fontSize: 12,
    fontWeight: "900",
    padding: 6,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 32,
    padding: 22,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricRight: {
    alignItems: "flex-end",
    flexShrink: 1,
    marginLeft: 16,
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  metricValue: {
    color: COLORS.blueDark,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 7,
  },
  metricTarget: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  progressTrack: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 7,
    height: 14,
    marginTop: 24,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: COLORS.blue,
    borderRadius: 7,
    height: "100%",
  },
  percentage: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 9,
    textAlign: "right",
  },
  sectionLabel: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 30,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 13,
  },
  beverageRow: {
    gap: 8,
    paddingTop: 13,
  },
  beverageButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  beverageButtonSelected: {
    backgroundColor: COLORS.blueDark,
    borderColor: COLORS.blueDark,
  },
  beverageLabel: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "800",
  },
  beverageLabelSelected: {
    color: COLORS.surface,
  },
  beveragePercentage: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  quickButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 8,
  },
  quickLabel: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "900",
  },
  quickBeverage: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  quickEquivalent: {
    color: COLORS.blueDark,
    fontSize: 9,
    marginTop: 2,
  },
  customRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 13,
  },
  amountInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    color: COLORS.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  compactButton: {
    alignItems: "center",
    backgroundColor: COLORS.blueDark,
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  compactButtonLabel: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  entryRow: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 14,
  },
  entryAmount: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  entryTime: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  entryEquivalent: {
    color: COLORS.blueDark,
    fontSize: 11,
    marginTop: 3,
  },
  entrySyncError: {
    color: "#A33A61",
    fontSize: 11,
    marginTop: 3,
  },
  entrySyncPending: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  entryActions: {
    alignItems: "center",
    flexDirection: "row",
  },
  removeLink: {
    color: "#A33A61",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 14,
  },
  status: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    gap: 14,
    marginTop: 32,
    padding: 30,
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  errorText: {
    color: "#A33A61",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
    textAlign: "center",
  },
  accountArea: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 32,
  },
  account: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
  },
  link: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.blueDark,
    borderRadius: 18,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 58,
    paddingHorizontal: 28,
  },
  primaryButtonLabel: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
});

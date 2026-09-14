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
  View,
} from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { formatLiters } from "../../screens/onboarding/utils";

type DrinkEntry = {
  id: string;
  clientEntryId: string;
  volumeMl: number;
  occurredAt: string;
  timeZone: string;
  source: string;
};

type TodayHydration = {
  date: string;
  dailyTargetMl: number;
  consumedMl: number;
  progress: number;
  entries: DrinkEntry[];
};

type AddEntryCommand = {
  clientEntryId: string;
  occurredAt: string;
  timeZone: string;
  volumeMl: number;
};

type AddEntryContext = {
  previous?: TodayHydration;
};

const quickAmounts = [250, 350, 500];

export default function HomeRoute() {
  const { copy, language } = useAppLabels();
  const { logout, request, user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const queryKey = ["hydration", "today", user?.email];
  const todayQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<TodayHydration>("/api/v1/hydration/today"),
    queryKey,
  });
  const addEntry = useMutation<TodayHydration, Error, AddEntryCommand, AddEntryContext>({
    mutationFn: (command: AddEntryCommand) => request<TodayHydration>(
      "/api/v1/hydration/entries",
      {
        body: JSON.stringify(command),
        method: "POST",
      },
    ),
    onError: (_error, _command, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodayHydration>(queryKey);

      if (previous) {
        const consumedMl = previous.consumedMl + command.volumeMl;
        queryClient.setQueryData<TodayHydration>(queryKey, {
          ...previous,
          consumedMl,
          entries: [{
            ...command,
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
    },
  });

  function logWater(volumeMl: number) {
    addEntry.mutate({
      clientEntryId: Crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      volumeMl,
    });
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
  const progress = hydration?.progress ?? 0;
  const progressWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>{copy.home.eyebrow}</Text>
        <Text style={styles.title}>{copy.home.title}</Text>
        <Text style={styles.description}>{copy.home.description}</Text>

        {todayQuery.isPending ? (
          <View style={styles.status}>
            <ActivityIndicator color={COLORS.blueDark} />
            <Text style={styles.statusText}>{copy.home.loading}</Text>
          </View>
        ) : todayQuery.isError || !hydration ? (
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

            <Text style={styles.sectionLabel}>{copy.home.quickAdd}</Text>
            <View style={styles.quickRow}>
              {quickAmounts.map((amount) => {
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
                    key={amount}
                    onPress={() => logWater(amount)}
                    style={({ pressed }) => [
                      styles.quickButton,
                      pressed && styles.pressed,
                      addEntry.isPending && styles.disabled,
                    ]}
                  >
                    <Ionicons color={COLORS.blueDark} name="add" size={19} />
                    <Text style={styles.quickLabel}>{formattedAmount}</Text>
                  </Pressable>
                );
              })}
            </View>
            {addEntry.isError && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {copy.home.addError}
              </Text>
            )}
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

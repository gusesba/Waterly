import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import type { HydrationHistory } from "../../services/hydration";

export default function HistoryRoute() {
  const { copy, language } = useAppLabels();
  const { request, user } = useAuth();
  const router = useRouter();
  const historyQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<HydrationHistory>("/api/v1/hydration/history?days=30"),
    queryKey: ["hydration", "history", user?.email],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Pressable accessibilityLabel={copy.accessibility.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Ionicons color={COLORS.blueDark} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>{copy.home.historyTitle}</Text>
        <Text style={styles.description}>{copy.home.historyDescription}</Text>

        {historyQuery.isPending ? (
          <ActivityIndicator color={COLORS.blueDark} style={styles.loading} />
        ) : historyQuery.isError ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.error}>{copy.home.loadError}</Text>
            <Pressable accessibilityRole="button" onPress={() => void historyQuery.refetch()}>
              <Text style={styles.link}>{copy.home.retry}</Text>
            </Pressable>
          </View>
        ) : !historyQuery.data?.days.length ? (
          <Text style={styles.empty}>{copy.home.noHistory}</Text>
        ) : historyQuery.data.days.map((day) => (
          <View key={day.date} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.date}>{formatDate(day.date, language)}</Text>
              <Text style={styles.progress}>{Math.round(day.progress * 100)}%</Text>
            </View>
            <Text style={styles.amount}>
              {day.consumedMl.toLocaleString(language)} / {day.dailyTargetMl.toLocaleString(language)} {copy.target.milliliters}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(day.progress * 100)}%` as `${number}%` }]} />
            </View>
            {day.entries.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.entryName}>
                  {copy.home.beverageNames[entry.beverageCode] ?? entry.beverageCode}
                </Text>
                <View style={styles.entryValues}>
                  <Text style={styles.entryAmount}>
                    {entry.volumeMl.toLocaleString(language)} {copy.target.milliliters}
                  </Text>
                  {entry.hydrationMl !== entry.volumeMl && (
                    <Text style={styles.entryEquivalent}>
                      {copy.home.waterEquivalent(
                        `${entry.hydrationMl.toLocaleString(language)} ${copy.target.milliliters}`,
                      )}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: string, language: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(language, {
    day: "numeric",
    month: "long",
    weekday: "short",
  });
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  screen: { paddingBottom: 32, paddingHorizontal: 24, paddingTop: 28 },
  back: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  title: { color: COLORS.ink, fontSize: 32, fontWeight: "900", marginTop: 16 },
  description: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  loading: { marginTop: 40 },
  status: { alignItems: "center", marginTop: 40 },
  error: { color: "#A33A61", fontSize: 13, textAlign: "center" },
  link: { color: COLORS.blueDark, fontSize: 13, fontWeight: "800", padding: 14 },
  empty: { color: COLORS.muted, fontSize: 14, marginTop: 32 },
  dayCard: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 18 },
  dayHeader: { flexDirection: "row", justifyContent: "space-between" },
  date: { color: COLORS.ink, fontSize: 15, fontWeight: "800", textTransform: "capitalize" },
  progress: { color: COLORS.blueDark, fontSize: 14, fontWeight: "900" },
  amount: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  track: { backgroundColor: COLORS.blueSoft, borderRadius: 5, height: 10, marginTop: 14, overflow: "hidden" },
  fill: { backgroundColor: COLORS.blue, borderRadius: 5, height: "100%" },
  entry: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  entryName: { color: COLORS.ink, fontSize: 13, fontWeight: "700" },
  entryValues: { alignItems: "flex-end" },
  entryAmount: { color: COLORS.muted, fontSize: 13 },
  entryEquivalent: { color: COLORS.blueDark, fontSize: 11, marginTop: 3 },
});

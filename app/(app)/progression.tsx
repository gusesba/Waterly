import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { buildProgressionTimeline, ProgressionBalance } from "../../services/progression";

export default function ProgressionRoute() {
  const { copy, language } = useAppLabels();
  const { request, user } = useAuth();
  const router = useRouter();
  const dropsQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<ProgressionBalance>("/api/v1/wallet"),
    queryKey: ["progression", "drops", user?.email],
  });
  const prestigeQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<ProgressionBalance>("/api/v1/prestige"),
    queryKey: ["progression", "prestige", user?.email],
  });
  const isPending = dropsQuery.isPending || prestigeQuery.isPending;
  const isError = dropsQuery.isError || prestigeQuery.isError;
  const timeline = buildProgressionTimeline(
    dropsQuery.data?.entries ?? [],
    prestigeQuery.data?.entries ?? [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Pressable
          accessibilityLabel={copy.accessibility.back}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons color={COLORS.blueDark} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>{copy.progression.title}</Text>
        <Text style={styles.description}>{copy.progression.description}</Text>

        {isPending ? (
          <ActivityIndicator color={COLORS.blueDark} style={styles.loading} />
        ) : isError ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.error}>{copy.home.loadError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void Promise.all([dropsQuery.refetch(), prestigeQuery.refetch()])}
            >
              <Text style={styles.link}>{copy.home.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.balanceRow}>
              <View style={[styles.balanceCard, styles.dropsCard]}>
                <Ionicons color={COLORS.blueDark} name="water" size={25} />
                <Text style={styles.balanceValue}>{dropsQuery.data?.balance.toLocaleString(language)}</Text>
                <Text style={styles.balanceLabel}>{copy.progression.drops}</Text>
              </View>
              <View style={[styles.balanceCard, styles.prestigeCard]}>
                <Ionicons color="#B84D1C" name="star" size={25} />
                <Text style={styles.balanceValue}>{prestigeQuery.data?.balance.toLocaleString(language)}</Text>
                <Text style={styles.balanceLabel}>{copy.progression.prestige}</Text>
              </View>
            </View>
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>{copy.progression.explanation}</Text>
            </View>
            <Text style={styles.sectionTitle}>{copy.progression.history}</Text>
            {!timeline.length ? (
              <Text style={styles.empty}>{copy.progression.empty}</Text>
            ) : timeline.map((item) => (
              <View key={`${item.currency}:${item.id}`} style={styles.entry}>
                <View style={styles.entryIcon}>
                  <Ionicons
                    color={item.currency === "drops" ? COLORS.blueDark : "#B84D1C"}
                    name={item.currency === "drops" ? "water" : "star"}
                    size={18}
                  />
                </View>
                <View style={styles.entryBody}>
                  <Text style={styles.entryTitle}>
                    {copy.progression.achievementReward(
                      copy.achievements.items[item.referenceId]?.title ?? item.referenceId,
                    )}
                  </Text>
                  <Text style={styles.entryDate}>
                    {new Date(item.createdAt).toLocaleDateString(language)}
                  </Text>
                </View>
                <Text style={styles.entryAmount}>
                  +{item.amount.toLocaleString(language)} {item.currency === "drops"
                    ? copy.progression.drops
                    : copy.progression.prestige}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  balanceRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  balanceCard: { borderRadius: 18, flex: 1, padding: 18 },
  dropsCard: { backgroundColor: COLORS.blueSoft },
  prestigeCard: { backgroundColor: "#FFF0E5" },
  balanceValue: { color: COLORS.ink, fontSize: 28, fontWeight: "900", marginTop: 10 },
  balanceLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "800", marginTop: 2 },
  explanation: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, marginTop: 14, padding: 14 },
  explanationText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: "900", marginTop: 28 },
  empty: { color: COLORS.muted, fontSize: 14, marginTop: 16 },
  entry: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 10, padding: 14 },
  entryIcon: { alignItems: "center", backgroundColor: COLORS.background, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  entryBody: { flex: 1 },
  entryTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  entryDate: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  entryAmount: { color: COLORS.success, flexShrink: 1, fontSize: 12, fontWeight: "900", textAlign: "right" },
});

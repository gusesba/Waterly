import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { Achievement, sortAchievements } from "../../services/habits";

const icons = {
  "first-goal": "trophy" as const,
  "streak-3": "flame" as const,
  "streak-7": "ribbon" as const,
};

export default function AchievementsRoute() {
  const { copy, language } = useAppLabels();
  const { request, user } = useAuth();
  const router = useRouter();
  const achievementsQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<Achievement[]>("/api/v1/achievements"),
    queryKey: ["habits", "achievements", user?.email],
    select: sortAchievements,
  });

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
        <Text style={styles.title}>{copy.achievements.title}</Text>
        <Text style={styles.description}>{copy.achievements.description}</Text>

        {achievementsQuery.isPending ? (
          <ActivityIndicator color={COLORS.blueDark} style={styles.loading} />
        ) : achievementsQuery.isError ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.error}>{copy.home.loadError}</Text>
            <Pressable accessibilityRole="button" onPress={() => void achievementsQuery.refetch()}>
              <Text style={styles.link}>{copy.home.retry}</Text>
            </Pressable>
          </View>
        ) : !achievementsQuery.data?.length ? (
          <Text style={styles.empty}>{copy.achievements.empty}</Text>
        ) : achievementsQuery.data.map((achievement) => {
          const definition = copy.achievements.items[achievement.code] ?? {
            description: achievement.code,
            title: achievement.code,
          };
          const percentage = Math.round((achievement.progress / achievement.requirement) * 100);
          return (
            <View key={achievement.code} style={[styles.card, achievement.isUnlocked && styles.cardUnlocked]}>
              <View style={[styles.icon, achievement.isUnlocked && styles.iconUnlocked]}>
                <Ionicons
                  color={achievement.isUnlocked ? "#E06A32" : COLORS.muted}
                  name={icons[achievement.code as keyof typeof icons] ?? "lock-closed"}
                  size={24}
                />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{definition.title}</Text>
                  <Text style={[styles.badge, achievement.isUnlocked && styles.badgeUnlocked]}>
                    {achievement.isUnlocked ? copy.achievements.unlocked : copy.achievements.locked}
                  </Text>
                </View>
                <Text style={styles.cardDescription}>{definition.description}</Text>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {copy.achievements.progress(achievement.progress, achievement.requirement)}
                  </Text>
                  <Text style={styles.progressLabel}>{percentage}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${percentage}%` as `${number}%` }]} />
                </View>
                {achievement.unlockedAt && (
                  <Text style={styles.unlockedAt}>
                    {copy.achievements.unlockedOn(new Date(achievement.unlockedAt).toLocaleDateString(language))}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
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
  empty: { color: COLORS.muted, fontSize: 14, marginTop: 32 },
  card: { alignItems: "flex-start", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 14, marginTop: 14, padding: 16 },
  cardUnlocked: { borderColor: "#F2B78F" },
  icon: { alignItems: "center", backgroundColor: "#EDF2F5", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  iconUnlocked: { backgroundColor: "#FFF0E5" },
  cardBody: { flex: 1 },
  cardHeader: { alignItems: "flex-start", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  cardTitle: { color: COLORS.ink, flex: 1, fontSize: 16, fontWeight: "900" },
  badge: { backgroundColor: "#EDF2F5", borderRadius: 10, color: COLORS.muted, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4 },
  badgeUnlocked: { backgroundColor: "#FFF0E5", color: "#B84D1C" },
  cardDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  progressLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  track: { backgroundColor: COLORS.blueSoft, borderRadius: 4, height: 8, marginTop: 6, overflow: "hidden" },
  fill: { backgroundColor: "#E06A32", borderRadius: 4, height: "100%" },
  unlockedAt: { color: COLORS.success, fontSize: 11, fontWeight: "700", marginTop: 9 },
});

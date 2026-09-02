import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { useAppLabels } from "../../hooks/useAppLabels";
import { useOnboarding } from "../../providers/OnboardingProvider";
import { useAuth } from "../../providers/AuthProvider";
import { formatLiters } from "../../screens/onboarding/utils";
import { COLORS } from "../../constants/theme";

export default function HomeRoute() {
  const { copy, language } = useAppLabels();
  const { draft } = useOnboarding();
  const { logout, user } = useAuth();
  const formattedTarget = formatLiters(
    draft.manualTarget,
    language,
    copy.target.liters,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.brandMark}>
          <Ionicons color={COLORS.surface} name="water" size={24} />
        </View>
        <Text style={styles.eyebrow}>{copy.home.eyebrow}</Text>
        <Text style={styles.title}>{copy.home.title}</Text>
        <Text style={styles.description}>{copy.home.description}</Text>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>{copy.home.dailyTarget}</Text>
          <Text style={styles.targetValue}>{formattedTarget}</Text>
        </View>
        {user && (
          <Text style={styles.account}>{copy.home.signedInAs(user.email)}</Text>
        )}
        <Pressable accessibilityRole="button" onPress={() => void logout()}>
          <Text style={styles.logout}>{copy.auth.logout}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  screen: {
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
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  title: {
    color: COLORS.ink,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 38,
    marginTop: 12,
    textAlign: "center",
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 380,
    textAlign: "center",
  },
  targetCard: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 30,
    paddingHorizontal: 32,
    paddingVertical: 22,
    width: "100%",
  },
  targetLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  targetValue: {
    color: COLORS.blueDark,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 8,
  },
  account: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 18,
    textAlign: "center",
  },
  logout: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});

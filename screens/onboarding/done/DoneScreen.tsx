import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/onboarding/PrimaryButton";
import { AppLanguage, LabelSet } from "../../../constants/labels";
import { COLORS } from "../../../constants/theme";
import { formatLiters } from "../utils";
import { SummaryCard } from "./components/SummaryCard";

const doneMascot = require("../../../assets/images/mascote/mascote-09.png");

type DoneScreenProps = {
  copy: LabelSet;
  language: AppLanguage;
  manualTarget: number;
  onReview: () => void;
  onStart: () => void;
  selectedGoalsCount: number;
};

export function DoneScreen({
  copy,
  language,
  manualTarget,
  onReview,
  onStart,
  selectedGoalsCount,
}: DoneScreenProps) {
  const formattedTarget = formatLiters(manualTarget, language, copy.target.liters);

  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons color={COLORS.surface} name="water" size={18} />
        </View>
        <Text style={styles.brandName}>{copy.appName}</Text>
      </View>

      <View style={styles.mascotCircle}>
        <Image source={doneMascot} style={styles.mascot} />
      </View>
      <View style={styles.successPill}>
        <Ionicons color={COLORS.success} name="checkmark-circle" size={18} />
        <Text style={styles.successPillText}>{copy.done.badge}</Text>
      </View>
      <Text style={styles.title}>{copy.done.title}</Text>
      <Text style={styles.description}>{copy.done.mission(formattedTarget)}</Text>

      <SummaryCard
        copy={copy}
        formattedTarget={formattedTarget}
        selectedGoalsCount={selectedGoalsCount}
      />

      <PrimaryButton
        icon="rocket-outline"
        label={copy.actions.startHydrating}
        onPress={onStart}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onReview}
        style={({ pressed }) => pressed && styles.buttonPressed}
      >
        <Text style={styles.reviewLink}>{copy.actions.reviewTarget}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 690,
    paddingBottom: 12,
    paddingTop: 12,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: 13,
    height: 34,
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
    width: 34,
  },
  brandName: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  mascotCircle: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.pinkSoft,
    borderRadius: 92,
    borderWidth: 8,
    height: 184,
    justifyContent: "center",
    marginBottom: 2,
    marginTop: 18,
    overflow: "hidden",
    width: 184,
  },
  mascot: {
    height: 170,
    resizeMode: "contain",
    width: 170,
  },
  successPill: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#E5F7F1",
    borderRadius: 20,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  successPillText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.4,
    lineHeight: 39,
    textAlign: "center",
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginHorizontal: 18,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  reviewLink: {
    color: COLORS.blueDark,
    fontSize: 13,
    fontWeight: "800",
    paddingVertical: 8,
    textAlign: "center",
  },
});

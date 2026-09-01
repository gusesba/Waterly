import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/onboarding/PrimaryButton";
import { AppLanguage, LabelSet } from "../../../constants/labels";
import { COLORS } from "../../../constants/theme";
import { formatLiters } from "../utils";
import { TargetCard } from "./components/TargetCard";

type TargetScreenProps = {
  copy: LabelSet;
  language: AppLanguage;
  onCommitTarget: () => void;
  onDecrease: () => void;
  onFinish: () => void;
  onIncrease: () => void;
  onTargetInputChange: (value: string) => void;
  recommendedTarget: number;
  targetInput: string;
  targetPreview: number;
};

export function TargetScreen({
  copy,
  language,
  onCommitTarget,
  onDecrease,
  onFinish,
  onIncrease,
  onTargetInputChange,
  recommendedTarget,
  targetInput,
  targetPreview,
}: TargetScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{copy.target.eyebrow}</Text>
      <Text style={styles.title}>{copy.target.title}</Text>
      <Text style={styles.description}>{copy.target.description}</Text>

      <TargetCard
        copy={copy}
        formattedTarget={formatLiters(targetPreview, language, copy.target.liters)}
        onCommitTarget={onCommitTarget}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onTargetInputChange={onTargetInputChange}
        targetInput={targetInput}
      />

      <View style={styles.recommendationNote}>
        <View style={styles.recommendationIcon}>
          <Ionicons color={COLORS.pink} name="bulb-outline" size={18} />
        </View>
        <Text style={styles.recommendationText}>
          {copy.target.recommendation(
            formatLiters(recommendedTarget, language, copy.target.liters),
          )}
        </Text>
      </View>

      <PrimaryButton
        icon="checkmark"
        label={copy.actions.defineTarget}
        onPress={onFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 10,
  },
  eyebrow: {
    color: COLORS.blueDark,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1.1,
    lineHeight: 35,
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  recommendationNote: {
    alignItems: "flex-start",
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 18,
    flexDirection: "row",
    gap: 11,
    marginBottom: 28,
    marginTop: 18,
    padding: 14,
  },
  recommendationIcon: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 13,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  recommendationText: {
    color: "#6E4555",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

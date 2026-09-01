import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { LabelSet } from "../../../../constants/labels";
import { COLORS } from "../../../../constants/theme";

type SummaryCardProps = {
  copy: LabelSet;
  formattedTarget: string;
  selectedGoalsCount: number;
};

export function SummaryCard({
  copy,
  formattedTarget,
  selectedGoalsCount,
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <Ionicons color={COLORS.blue} name="water" size={22} />
        <View style={styles.copy}>
          <Text style={styles.label}>{copy.done.dailyTarget}</Text>
          <Text style={styles.value}>{formattedTarget}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons color={COLORS.pink} name="flag" size={22} />
        <View style={styles.copy}>
          <Text style={styles.label}>{copy.done.goals}</Text>
          <Text style={styles.value}>{copy.done.chosenGoals(selectedGoalsCount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  item: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minWidth: 0,
  },
  copy: {
    flexShrink: 1,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
    width: 1,
  },
  label: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  value: {
    color: COLORS.ink,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
});

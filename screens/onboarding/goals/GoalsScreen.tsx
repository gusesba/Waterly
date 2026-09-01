import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/onboarding/PrimaryButton";
import { GoalId, LabelSet } from "../../../constants/labels";
import { COLORS } from "../../../constants/theme";
import { GoalOption } from "./components/GoalOption";

const goalsMascot = require("../../../assets/images/mascote/mascote-03.png");

const goalIcons: Record<GoalId, keyof typeof Ionicons.glyphMap> = {
  habit: "calendar-outline",
  energy: "flash-outline",
  training: "barbell-outline",
  focus: "sparkles-outline",
  wellbeing: "heart-outline",
  soda: "water-outline",
};

type GoalsScreenProps = {
  copy: LabelSet;
  onContinue: () => void;
  onToggleGoal: (goalId: GoalId) => void;
  selectedGoals: GoalId[];
};

export function GoalsScreen({
  copy,
  onContinue,
  onToggleGoal,
  selectedGoals,
}: GoalsScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.mascotRow}>
        <Image source={goalsMascot} style={styles.mascot} />
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{copy.goals.helper}</Text>
        </View>
      </View>

      <Text style={styles.title}>{copy.goals.title}</Text>
      <Text style={styles.description}>{copy.goals.description}</Text>

      <View style={styles.goalList}>
        {copy.goals.options.map((goal) => (
          <GoalOption
            description={goal.description}
            icon={goalIcons[goal.id]}
            isSelected={selectedGoals.includes(goal.id)}
            key={goal.id}
            label={goal.label}
            onPress={() => onToggleGoal(goal.id)}
          />
        ))}
      </View>

      <PrimaryButton
        disabled={selectedGoals.length === 0}
        label={copy.actions.continue}
        onPress={onContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 10,
  },
  mascotRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
    minHeight: 88,
  },
  mascot: {
    height: 88,
    resizeMode: "contain",
    width: 88,
  },
  speechBubble: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexShrink: 1,
    marginLeft: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  speechText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
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
  goalList: {
    gap: 10,
    marginBottom: 24,
    marginTop: 24,
  },
});

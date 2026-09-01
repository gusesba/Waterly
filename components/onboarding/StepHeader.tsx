import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/theme";

type StepHeaderProps = {
  backLabel: string;
  currentStep: number;
  onBack: () => void;
  progressLabel: string;
  totalSteps: number;
};

export function StepHeader({
  backLabel,
  currentStep,
  onBack,
  progressLabel,
  totalSteps,
}: StepHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
      >
        <Ionicons color={COLORS.ink} name="arrow-back" size={22} />
      </Pressable>

      <View style={styles.progressArea}>
        <Text style={styles.progressLabel}>{progressLabel}</Text>
        <View style={styles.progressTrack}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index < currentStep && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  progressArea: {
    alignItems: "center",
    flex: 1,
    gap: 7,
  },
  progressLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
    maxWidth: 210,
    width: "100%",
  },
  progressSegment: {
    backgroundColor: "#D9E6ED",
    borderRadius: 4,
    flex: 1,
    height: 5,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.blue,
  },
  headerSpacer: {
    width: 44,
  },
});

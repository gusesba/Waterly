import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { LabelSet } from "../../../../constants/labels";
import { COLORS } from "../../../../constants/theme";

const targetMascot = require("../../../../assets/images/mascote/mascote-10.png");

type TargetCardProps = {
  copy: LabelSet;
  formattedTarget: string;
  onCommitTarget: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onTargetInputChange: (value: string) => void;
  targetInput: string;
};

export function TargetCard({
  copy,
  formattedTarget,
  onCommitTarget,
  onDecrease,
  onIncrease,
  onTargetInputChange,
  targetInput,
}: TargetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <Image source={targetMascot} style={styles.mascot} />
      <View style={styles.valueArea}>
        <Text style={styles.value}>{formattedTarget}</Text>
        <Text style={styles.unit}>{copy.target.perDay}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={copy.target.decrease}
          accessibilityRole="button"
          onPress={onDecrease}
          style={({ pressed }) => [styles.controlButton, pressed && styles.buttonPressed]}
        >
          <Ionicons color={COLORS.blueDark} name="remove" size={24} />
        </Pressable>

        <View style={styles.inputArea}>
          <Ionicons color={COLORS.blue} name="water" size={16} />
          <TextInput
            accessibilityLabel={copy.target.editHint}
            keyboardType="number-pad"
            maxLength={4}
            onBlur={onCommitTarget}
            onChangeText={(value) => onTargetInputChange(value.replace(/[^0-9]/g, ""))}
            onSubmitEditing={onCommitTarget}
            selectTextOnFocus
            selectionColor={COLORS.blue}
            style={styles.input}
            value={targetInput}
          />
          <Text style={styles.milliliters}>{copy.target.milliliters}</Text>
        </View>

        <Pressable
          accessibilityLabel={copy.target.increase}
          accessibilityRole="button"
          onPress={onIncrease}
          style={({ pressed }) => [styles.controlButton, pressed && styles.buttonPressed]}
        >
          <Ionicons color={COLORS.blueDark} name="add" size={24} />
        </Pressable>
      </View>
      <Text style={styles.editHint}>{copy.target.editHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 30,
    borderWidth: 1,
    marginTop: 28,
    overflow: "hidden",
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
    position: "relative",
    shadowColor: "#3979A8",
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  glow: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 100,
    height: 170,
    position: "absolute",
    right: -50,
    top: -70,
    width: 170,
  },
  mascot: {
    height: 112,
    resizeMode: "contain",
    width: 130,
  },
  valueArea: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  value: {
    color: COLORS.ink,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
  },
  unit: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  controls: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    padding: 7,
    width: "100%",
  },
  controlButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 15,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  inputArea: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minWidth: 0,
  },
  input: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    maxWidth: 76,
    minWidth: 52,
    paddingHorizontal: 2,
    paddingVertical: 4,
    textAlign: "right",
  },
  milliliters: {
    color: COLORS.ink,
    flexShrink: 0,
    fontSize: 15,
    fontWeight: "800",
  },
  editHint: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
});

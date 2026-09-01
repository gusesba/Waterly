import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon = "arrow-forward",
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconBubble}>
        <Ionicons color={COLORS.blueDark} name={icon} size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: COLORS.blueDark,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 60,
    paddingLeft: 22,
    paddingRight: 8,
    shadowColor: COLORS.blueDark,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
  buttonDisabled: {
    backgroundColor: "#AFC1CC",
    shadowOpacity: 0,
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  label: {
    color: COLORS.surface,
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    paddingVertical: 8,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});

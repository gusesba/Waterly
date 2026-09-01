import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../../../constants/theme";

type GoalOptionProps = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

export function GoalOption({
  description,
  icon,
  isSelected,
  label,
  onPress,
}: GoalOptionProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const selection = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selection, {
      damping: 14,
      stiffness: 220,
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selection]);

  function handlePress() {
    Animated.sequence([
      Animated.timing(pulse, { duration: 70, toValue: 0.975, useNativeDriver: true }),
      Animated.spring(pulse, { damping: 12, stiffness: 260, toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.icon, isSelected && styles.iconSelected]}>
          <Ionicons color={isSelected ? COLORS.blueDark : COLORS.muted} name={icon} size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Animated.View
          style={[
            styles.checkCircle,
            isSelected && styles.checkCircleSelected,
            {
              transform: [{
                scale: selection.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }),
              }],
            },
          ]}
        >
          {isSelected && <Ionicons color={COLORS.surface} name="checkmark" size={16} />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    padding: 13,
  },
  cardSelected: {
    backgroundColor: "#F4FAFF",
    borderColor: COLORS.blue,
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.82,
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#EEF3F6",
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  iconSelected: {
    backgroundColor: COLORS.blueSoft,
  },
  copy: {
    flex: 1,
    marginLeft: 14,
  },
  label: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  description: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  checkCircle: {
    alignItems: "center",
    borderColor: "#BAC9D2",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkCircleSelected: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
});

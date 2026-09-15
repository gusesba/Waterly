import { Animated, StyleSheet, ViewStyle } from "react-native";

import type { AuraCode } from "../services/cosmetics";
import type { MascotMood } from "../services/hydrationFeedback";

const images = {
  complete: require("../assets/images/mascote/mascote-04.png"),
  empty: require("../assets/images/mascote/mascote-16.png"),
  progress: require("../assets/images/mascote/mascote-02.png"),
};

const auraStyles: Record<AuraCode, ViewStyle> = {
  natural: { backgroundColor: "#FCE8F0", borderColor: "#F4B5CC" },
  ocean: { backgroundColor: "#DCEFFD", borderColor: "#65AFE8" },
  sunset: { backgroundColor: "#FFF0E5", borderColor: "#F2A36B" },
  stellar: { backgroundColor: "#EEE8FF", borderColor: "#8B73D6" },
};

type Props = {
  accessibilityLabel: string;
  auraCode?: AuraCode;
  mood: MascotMood;
  scale?: Animated.Value;
  size?: number;
};

export function Mascot({ accessibilityLabel, auraCode = "natural", mood, scale, size = 92 }: Props) {
  return (
    <Animated.View
      style={[
        styles.aura,
        auraStyles[auraCode],
        { borderRadius: (size + 16) / 2, height: size + 16, width: size + 16 },
        scale ? { transform: [{ scale }] } : undefined,
      ]}
    >
      <Animated.Image
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        source={images[mood]}
        style={{ borderRadius: size / 2, height: size, width: size }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  aura: {
    alignItems: "center",
    borderWidth: 3,
    justifyContent: "center",
    shadowColor: "#122B3F",
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
});

import { StyleSheet, View } from "react-native";

export function OnboardingBackground() {
  return (
    <View pointerEvents="none" style={styles.background}>
      <View style={styles.blueOrb} />
      <View style={styles.pinkOrb} />
      <View style={styles.smallOrb} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blueOrb: {
    backgroundColor: "rgba(120, 200, 244, 0.18)",
    borderRadius: 160,
    height: 280,
    position: "absolute",
    right: -130,
    top: -70,
    width: 280,
  },
  pinkOrb: {
    backgroundColor: "rgba(240, 111, 158, 0.08)",
    borderRadius: 130,
    bottom: 60,
    height: 230,
    left: -150,
    position: "absolute",
    width: 230,
  },
  smallOrb: {
    backgroundColor: "rgba(45, 134, 213, 0.08)",
    borderRadius: 50,
    height: 72,
    left: 34,
    position: "absolute",
    top: 174,
    width: 72,
  },
});

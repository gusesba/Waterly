import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

import { COLORS } from "../../../../constants/theme";

const welcomeMascot = require("../../../../assets/images/mascote/mascote-02.png");

export function MascotStage() {
  return (
    <View style={styles.stage}>
      <View style={styles.sparkleOne}>
        <Ionicons color="#F3AA32" name="sparkles" size={22} />
      </View>
      <View style={styles.sparkleTwo}>
        <Ionicons color={COLORS.blue} name="sparkles" size={16} />
      </View>
      <View style={styles.mascotCircle}>
        <Image source={welcomeMascot} style={styles.mascot} />
      </View>
      <View style={styles.floatingDrop}>
        <Ionicons color={COLORS.surface} name="water" size={18} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: "center",
    alignSelf: "center",
    height: 270,
    justifyContent: "center",
    marginVertical: 8,
    position: "relative",
    width: 300,
  },
  mascotCircle: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: "rgba(45, 134, 213, 0.16)",
    borderRadius: 115,
    borderWidth: 1,
    height: 230,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#3979A8",
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    width: 230,
  },
  mascot: {
    height: 210,
    resizeMode: "contain",
    width: 210,
  },
  sparkleOne: {
    left: 18,
    position: "absolute",
    top: 26,
  },
  sparkleTwo: {
    position: "absolute",
    right: 14,
    top: 68,
  },
  floatingDrop: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.background,
    borderRadius: 23,
    borderWidth: 4,
    bottom: 24,
    height: 46,
    justifyContent: "center",
    position: "absolute",
    right: 29,
    transform: [{ rotate: "8deg" }],
    width: 46,
  },
});

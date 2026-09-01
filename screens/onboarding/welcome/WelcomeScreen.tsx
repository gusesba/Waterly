import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/onboarding/PrimaryButton";
import { LabelSet } from "../../../constants/labels";
import { COLORS } from "../../../constants/theme";
import { MascotStage } from "./components/MascotStage";

type WelcomeScreenProps = {
  copy: LabelSet;
  onContinue: () => void;
};

export function WelcomeScreen({ copy, onContinue }: WelcomeScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons color={COLORS.surface} name="water" size={18} />
        </View>
        <Text style={styles.brandName}>{copy.appName}</Text>
      </View>

      <MascotStage />

      <View style={styles.copyArea}>
        <View style={styles.eyebrowPill}>
          <Text style={styles.eyebrowText}>{copy.welcome.eyebrow}</Text>
        </View>
        <Text style={styles.title}>
          {copy.welcome.title}
          <Text style={styles.titleAccent}>{copy.welcome.titleAccent}</Text>
        </Text>
        <Text style={styles.description}>{copy.welcome.description}</Text>
      </View>

      <PrimaryButton label={copy.welcome.start} onPress={onContinue} />
      <Text style={styles.footnote}>{copy.welcome.footnote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 690,
    paddingBottom: 12,
    paddingTop: 12,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: 13,
    height: 34,
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
    width: 34,
  },
  brandName: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  copyArea: {
    alignItems: "center",
    gap: 14,
  },
  eyebrowPill: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  eyebrowText: {
    color: COLORS.blueDark,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 39,
    textAlign: "center",
  },
  titleAccent: {
    color: COLORS.pink,
  },
  description: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 350,
    textAlign: "center",
  },
  footnote: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: -10,
    textAlign: "center",
  },
});

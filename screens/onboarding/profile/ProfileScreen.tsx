import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../../components/onboarding/PrimaryButton";
import { LabelSet } from "../../../constants/labels";
import { COLORS } from "../../../constants/theme";
import { NumberField } from "./components/NumberField";

type ProfileScreenProps = {
  age: string;
  copy: LabelSet;
  height: string;
  isComplete: boolean;
  onAgeChange: (value: string) => void;
  onContinue: () => void;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  weight: string;
};

export function ProfileScreen({
  age,
  copy,
  height,
  isComplete,
  onAgeChange,
  onContinue,
  onHeightChange,
  onWeightChange,
  weight,
}: ProfileScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionIcon}>
        <Ionicons color={COLORS.blueDark} name="body-outline" size={26} />
      </View>
      <Text style={styles.title}>{copy.profile.title}</Text>
      <Text style={styles.description}>{copy.profile.description}</Text>

      <View style={styles.formCard}>
        <NumberField
          label={copy.profile.height}
          onChangeText={onHeightChange}
          placeholder={copy.profile.heightPlaceholder}
          unit={copy.profile.heightUnit}
          value={height}
        />
        <View style={styles.divider} />
        <NumberField
          label={copy.profile.age}
          onChangeText={onAgeChange}
          placeholder={copy.profile.agePlaceholder}
          unit={copy.profile.ageUnit}
          value={age}
        />
        <View style={styles.divider} />
        <NumberField
          label={copy.profile.weight}
          onChangeText={onWeightChange}
          placeholder={copy.profile.weightPlaceholder}
          unit={copy.profile.weightUnit}
          value={weight}
        />
      </View>

      <View style={styles.privacyNote}>
        <Ionicons color={COLORS.blueDark} name="lock-closed" size={16} />
        <Text style={styles.privacyText}>{copy.profile.privacy}</Text>
      </View>

      <PrimaryButton
        disabled={!isComplete}
        icon="sparkles"
        label={copy.actions.calculate}
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
  sectionIcon: {
    alignItems: "center",
    backgroundColor: COLORS.blueSoft,
    borderRadius: 21,
    height: 54,
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 12,
    width: 54,
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
  formCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 30,
    paddingHorizontal: 18,
    shadowColor: "#547A93",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: StyleSheet.hairlineWidth,
  },
  privacyNote: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
    marginBottom: 32,
    marginTop: 18,
    paddingHorizontal: 6,
  },
  privacyText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

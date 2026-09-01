import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../../../../constants/theme";

type NumberFieldProps = {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit: string;
  value: string;
};

export function NumberField({
  label,
  onChangeText,
  placeholder,
  unit,
  value,
}: NumberFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor="#A7B6C0"
          returnKeyType="next"
          selectionColor={COLORS.blue}
          style={styles.input}
          value={value}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    paddingVertical: 18,
  },
  label: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderColor: "#D7E4EB",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    overflow: "hidden",
    paddingHorizontal: 16,
    width: "100%",
  },
  input: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    minHeight: 56,
    minWidth: 0,
    paddingVertical: 0,
  },
  unit: {
    color: COLORS.muted,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
});

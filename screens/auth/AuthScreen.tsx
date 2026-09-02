import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { LabelSet } from "../../constants/labels";
import { COLORS } from "../../constants/theme";
import type { AuthMode } from "../../providers/AuthProvider";
import { ApiError } from "../../services/api";

type AuthScreenProps = {
  copy: LabelSet;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthScreen({ copy, mode, onModeChange, onSubmit }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      setError(copy.auth.errors.invalidEmail);
      return;
    }

    if (password.length < 8) {
      setError(copy.auth.errors.shortPassword);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(normalizedEmail, password);
    } catch (error) {
      setError(getAuthenticationError(error, isRegister, copy));
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode() {
    setError(null);
    onModeChange(isRegister ? "login" : "register");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons color={COLORS.surface} name="water" size={18} />
        </View>
        <Text style={styles.brandName}>{copy.appName}</Text>
      </View>

      <View style={styles.heading}>
        <Text style={styles.eyebrow}>{copy.auth.eyebrow}</Text>
        <Text style={styles.title}>
          {isRegister ? copy.auth.registerTitle : copy.auth.loginTitle}
        </Text>
        <Text style={styles.description}>
          {isRegister ? copy.auth.registerDescription : copy.auth.loginDescription}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>{copy.auth.email}</Text>
          <TextInput
            accessibilityLabel={copy.auth.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={copy.auth.emailPlaceholder}
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{copy.auth.password}</Text>
          <TextInput
            accessibilityLabel={copy.auth.password}
            autoCapitalize="none"
            autoComplete={isRegister ? "new-password" : "current-password"}
            onChangeText={setPassword}
            placeholder={copy.auth.passwordPlaceholder}
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Text style={styles.hint}>{copy.auth.passwordHint}</Text>
        </View>

        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.pressed,
            isSubmitting && styles.disabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.submitLabel}>
              {isRegister ? copy.auth.createAccount : copy.auth.login}
            </Text>
          )}
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={changeMode} style={styles.switchButton}>
        <Text style={styles.switchText}>
          {isRegister ? copy.auth.haveAccount : copy.auth.needAccount}{" "}
          <Text style={styles.switchLink}>
            {isRegister ? copy.auth.login : copy.auth.createAccount}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

function getAuthenticationError(error: unknown, isRegister: boolean, copy: LabelSet) {
  if (!(error instanceof ApiError)) {
    return copy.auth.errors.serverUnavailable;
  }

  if (!isRegister && (error.status === 400 || error.status === 401)) {
    return copy.auth.errors.loginFailed;
  }

  if (isRegister && error.status === 400 && hasDuplicateEmailError(error.details)) {
    return copy.auth.errors.accountInUse;
  }

  if (isRegister && error.status === 400) {
    return copy.auth.errors.registerFailed;
  }

  return copy.auth.errors.serverUnavailable;
}

function hasDuplicateEmailError(details: unknown) {
  if (!details || typeof details !== "object" || !("errors" in details)) {
    return false;
  }

  const errors = details.errors;

  if (!errors || typeof errors !== "object") {
    return false;
  }

  return Object.keys(errors).some((key) => key.startsWith("Duplicate"));
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 650,
    paddingBottom: 24,
    paddingTop: 24,
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
  heading: {
    marginTop: 64,
  },
  eyebrow: {
    color: COLORS.blueDark,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.3,
    lineHeight: 40,
    marginTop: 12,
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  form: {
    gap: 18,
    marginTop: 36,
  },
  field: {
    gap: 8,
  },
  label: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    color: COLORS.ink,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 12,
    color: "#A33A61",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: COLORS.blueDark,
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 58,
  },
  submitLabel: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    backgroundColor: "#AFC1CC",
  },
  switchButton: {
    marginTop: "auto",
    paddingVertical: 18,
  },
  switchText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  switchLink: {
    color: COLORS.blueDark,
    fontWeight: "800",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import {
  DEFAULT_REMINDER_TIMES,
  loadReminderSettings,
  normalizeReminderTimes,
  type ReminderSettings,
} from "../../services/reminderSettings";
import { disableReminders, enableReminders } from "../../services/reminders";

export default function RemindersRoute() {
  const { copy } = useAppLabels();
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [times, setTimes] = useState(DEFAULT_REMINDER_TIMES);
  const [error, setError] = useState<"denied" | "generic" | "invalid" | "unsupported" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadReminderSettings(user.email).then((loaded) => {
      setSettings(loaded);
      setTimes([
        ...loaded.times,
        ...DEFAULT_REMINDER_TIMES.filter((time) => !loaded.times.includes(time)),
      ].slice(0, 3));
    });
  }, [user]);

  async function saveEnabled() {
    if (!user || !settings) return;
    if (normalizeReminderTimes(times).length !== times.filter(Boolean).length) {
      setError("invalid");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const next = await enableReminders(user.email, settings, times, {
        body: copy.reminders.notificationBody,
        channelName: copy.reminders.channelName,
        title: copy.reminders.notificationTitle,
      });
      setSettings(next);
      setTimes(next.times);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "";
      if (reason === "permission-denied") {
        try {
          setSettings(await disableReminders(user.email, settings));
        } catch {
          setError("generic");
          return;
        }
      }
      setError(reason === "permission-denied"
        ? "denied"
        : reason === "unsupported-platform"
          ? "unsupported"
          : reason === "invalid-times"
            ? "invalid"
            : "generic");
    } finally {
      setIsSaving(false);
    }
  }

  async function turnOff() {
    if (!user || !settings) return;
    setError(null);
    setIsSaving(true);
    try {
      setSettings(await disableReminders(user.email, settings));
    } catch {
      setError("generic");
    } finally {
      setIsSaving(false);
    }
  }

  const errorMessage = error === "denied"
    ? copy.reminders.permissionDenied
    : error === "invalid"
      ? copy.reminders.invalidTime
      : error === "unsupported"
        ? copy.reminders.unsupported
        : error === "generic"
          ? copy.reminders.saveError
          : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Pressable
          accessibilityLabel={copy.accessibility.back}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons color={COLORS.blueDark} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>{copy.reminders.title}</Text>
        <Text style={styles.description}>{copy.reminders.description}</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{copy.reminders.daily}</Text>
              <Text style={styles.cardDescription}>
                {settings?.enabled ? copy.reminders.enabled : copy.reminders.disabled}
              </Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: settings?.enabled === true, disabled: isSaving }}
              disabled={!settings || isSaving}
              onPress={() => settings?.enabled ? void turnOff() : void saveEnabled()}
              style={[styles.switch, settings?.enabled && styles.switchEnabled]}
            >
              <View style={[styles.switchThumb, settings?.enabled && styles.switchThumbEnabled]} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>{copy.reminders.times}</Text>
          <View style={styles.timeRow}>
            {times.map((time, index) => (
              <TextInput
                accessibilityLabel={copy.reminders.timeLabel(index + 1)}
                editable={!isSaving}
                key={index}
                maxLength={5}
                onChangeText={(value) => setTimes((current) => current.map(
                  (item, itemIndex) => itemIndex === index ? value : item,
                ))}
                placeholder="HH:mm"
                style={styles.timeInput}
                value={time}
              />
            ))}
          </View>
          {settings?.enabled && (
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => void saveEnabled()}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryLabel}>
                {isSaving ? copy.reminders.saving : copy.reminders.save}
              </Text>
            </Pressable>
          )}
        </View>

        {errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}
        {error === "denied" && Platform.OS !== "web" && (
          <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()}>
            <Text style={styles.link}>{copy.reminders.openSettings}</Text>
          </Pressable>
        )}
        <Text style={styles.note}>{copy.reminders.localNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  screen: { paddingBottom: 32, paddingHorizontal: 24, paddingTop: 28 },
  back: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  title: { color: COLORS.ink, fontSize: 32, fontWeight: "900", marginTop: 16 },
  description: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  card: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, marginTop: 24, padding: 18 },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardCopy: { flex: 1, paddingRight: 16 },
  cardTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "800" },
  cardDescription: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  switch: { backgroundColor: COLORS.border, borderRadius: 16, height: 32, padding: 3, width: 54 },
  switchEnabled: { backgroundColor: COLORS.blue },
  switchThumb: { backgroundColor: COLORS.surface, borderRadius: 13, height: 26, width: 26 },
  switchThumbEnabled: { alignSelf: "flex-end" },
  sectionLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "800", marginTop: 24 },
  timeRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  timeInput: { backgroundColor: COLORS.background, borderColor: COLORS.border, borderRadius: 12, borderWidth: 1, color: COLORS.ink, flex: 1, fontSize: 16, fontWeight: "700", paddingHorizontal: 12, paddingVertical: 12, textAlign: "center" },
  primaryButton: { alignItems: "center", backgroundColor: COLORS.blueDark, borderRadius: 14, marginTop: 18, padding: 14 },
  primaryLabel: { color: COLORS.surface, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  error: { color: "#A33A61", fontSize: 13, lineHeight: 19, marginTop: 18 },
  link: { color: COLORS.blueDark, fontSize: 13, fontWeight: "800", paddingVertical: 14 },
  note: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 22 },
});

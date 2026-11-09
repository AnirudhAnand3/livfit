import { useState, useCallback } from "react";
import { View, Text, Pressable, Switch, StyleSheet, Alert, Platform, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { REMINDER_TYPES, defaultReminderSettings } from "../../domain/reminders.mjs";
import { loadReminderSettings, saveReminderSettings, loadPlanData, loadWorkoutCompletions, clearPlanData, clearUid } from "../../data/local/storage.mjs";
import { loadFoodLog } from "../../data/local/storage.mjs";
import { syncReminders } from "../../services/notify.js";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { lastNDates } from "../../domain/progress.mjs";
import { dateKey } from "../../domain/foodLog.mjs";
import { colors, spacing, type, radius } from "../../ui/tokens";

function formatTime(hour, minute) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [deleteStage, setDeleteStage] = useState("idle"); // idle | confirm | deleting
  const [exporting, setExporting] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    await clearUid();
    router.replace("/");
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadReminderSettings().then((saved) => {
        if (!active) return;
        setSettings(saved || defaultReminderSettings());
      });
      return () => {
        active = false;
        setDeleteStage("idle");
      };
    }, [])
  );

  if (!settings) return <View style={styles.container} />;

  const persist = async (next) => {
    setSettings(next);
    await saveReminderSettings(next);
    let context = {};
    const planData = await loadPlanData();
    if (planData?.plan?.sessions?.length) {
      const dayIndex = new Date().getDay() % planData.plan.sessions.length;
      context = { sessionName: planData.plan.sessions[dayIndex].name };
    }
    const result = await syncReminders(next, context);
    if (!result.ok && result.reason === "permission_denied") {
      Alert.alert("Notifications disabled", "Enable notifications in system settings to receive reminders.");
    }
  };

  const toggle = (typeId) => {
    const next = { ...settings, [typeId]: { ...settings[typeId], enabled: !settings[typeId].enabled } };
    persist(next);
  };

  const onTimeChange = (typeId, event, selectedDate) => {
    setPickerFor(null);
    if (!selectedDate) return;
    const next = {
      ...settings,
      [typeId]: { ...settings[typeId], hour: selectedDate.getHours(), minute: selectedDate.getMinutes() },
    };
    persist(next);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const [planData, completions, reminderSettings] = await Promise.all([
        loadPlanData(),
        loadWorkoutCompletions(),
        loadReminderSettings(),
      ]);
      const dates = lastNDates(30);
      const foodLogs = {};
      for (const d of dates) {
        const key = dateKey(d);
        const entries = await loadFoodLog(d);
        if (entries.length > 0) foodLogs[key] = entries;
      }
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        plan: planData,
        workoutCompletions: completions,
        foodLogs,
        reminderSettings,
      };
      const json = JSON.stringify(exportPayload, null, 2);
      const fileUri = FileSystem.cacheDirectory + "livfit-export.json";
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: "application/json", dialogTitle: "Export LivFit data" });
      } else {
        Alert.alert("Sharing unavailable", "Your device doesn't support file sharing.");
      }
    } catch (e) {
      console.warn("Export failed", e);
      Alert.alert("Export failed", "Something went wrong. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteStage("deleting");
    try {
      await clearPlanData();
      await syncReminders({ workout: { enabled: false }, food_log: { enabled: false }, wind_down: { enabled: false } }, {});
      await signOut(auth);
      await clearUid();
      router.replace("/");
    } catch (e) {
      console.warn("Delete failed", e);
      setDeleteStage("idle");
      Alert.alert("Delete failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.sectionTitle}>Reminders</Text>
      {Object.keys(REMINDER_TYPES).map((typeId) => {
        const def = REMINDER_TYPES[typeId];
        const s = settings[typeId];
        return (
          <View key={typeId} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{def.title}</Text>
              <Pressable disabled={!s.enabled} onPress={() => setPickerFor(typeId)}>
                <Text style={[styles.rowTime, !s.enabled && styles.rowTimeDisabled]}>
                  {formatTime(s.hour, s.minute)}
                </Text>
              </Pressable>
            </View>
            <Switch
              value={s.enabled}
              onValueChange={() => toggle(typeId)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        );
      })}

      {pickerFor && (
        <DateTimePicker
          value={(() => { const d = new Date(); d.setHours(settings[pickerFor].hour, settings[pickerFor].minute, 0, 0); return d; })()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => onTimeChange(pickerFor, event, date)}
        />
      )}

      <Text style={styles.sectionTitle}>About your numbers</Text>
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerText}>
          Calorie and macro targets are estimates based on the Mifflin-St Jeor formula, typically accurate within 10–15%. They are not medical advice. Adjust your targets based on real progress over 2–4 weeks, and consult a qualified professional before making significant changes to your diet or training.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your data</Text>
      <Pressable
        style={[styles.actionBtn, exporting && styles.actionBtnDisabled]}
        onPress={handleExport}
        disabled={exporting}
      >
        <Text style={styles.actionBtnText}>{exporting ? "Preparing export…" : "Export all data"}</Text>
        <Text style={styles.actionBtnCaption}>Last 30 days of food logs, your plan, workout history</Text>
      </Pressable>

      {deleteStage === "idle" && (
        <Pressable style={styles.deleteBtn} onPress={() => setDeleteStage("confirm")}>
          <Text style={styles.deleteBtnText}>Delete all data</Text>
        </Pressable>
      )}

      {deleteStage === "confirm" && (
        <View style={styles.deleteConfirmCard}>
          <Text style={styles.deleteConfirmTitle}>Are you sure?</Text>
          <Text style={styles.deleteConfirmBody}>
            This will permanently delete your plan, food logs, workout history, and reminder settings. You'll start fresh from onboarding. This cannot be undone.
          </Text>
          <View style={styles.deleteConfirmRow}>
            <Pressable style={styles.deleteConfirmCancel} onPress={() => setDeleteStage("idle")}>
              <Text style={styles.deleteConfirmCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.deleteConfirmProceed} onPress={handleDeleteConfirm}>
              <Text style={styles.deleteConfirmProceedText}>Delete everything</Text>
            </Pressable>
          </View>
        </View>
      )}

      {deleteStage === "deleting" && (
        <View style={styles.deleteConfirmCard}>
          <Text style={styles.deleteConfirmBody}>Deleting…</Text>
        </View>
      )}

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log out</Text>
      </Pressable>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  sectionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.md, marginTop: spacing.lg },
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  rowTitle: { ...type.body, color: colors.text, marginBottom: 2 },
  rowTime: { ...type.caption, color: colors.primary, fontWeight: "700" },
  rowTimeDisabled: { color: colors.textMuted },
  disclaimerCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  disclaimerText: { ...type.caption, color: colors.textMuted, lineHeight: 20 },
  actionBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: 2 },
  actionBtnCaption: { ...type.caption, color: colors.textMuted },
  deleteBtn: {
    borderRadius: radius.md, padding: spacing.md, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm,
  },
  deleteBtnText: { ...type.body, color: colors.textMuted, fontWeight: "700" },
  deleteConfirmCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1.5, borderColor: colors.warning, marginBottom: spacing.sm,
  },
  deleteConfirmTitle: { ...type.body, color: colors.warning, fontWeight: "700", marginBottom: spacing.sm },
  deleteConfirmBody: { ...type.caption, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  deleteConfirmRow: { flexDirection: "row", gap: spacing.sm },
  deleteConfirmCancel: {
    flex: 1, borderRadius: radius.sm, paddingVertical: spacing.sm,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  deleteConfirmCancelText: { ...type.body, color: colors.textMuted, fontWeight: "700" },
  deleteConfirmProceed: {
    flex: 1, borderRadius: radius.sm, paddingVertical: spacing.sm,
    alignItems: "center", backgroundColor: colors.warning,
  },
  deleteConfirmProceedText: { ...type.body, color: colors.bg, fontWeight: "700" },
  logoutBtn: {
    borderRadius: radius.md, padding: spacing.md, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm,
  },
  logoutBtnText: { ...type.body, color: colors.textMuted, fontWeight: "700" },
});






import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { REMINDER_TYPES, buildReminderBody, enabledReminders } from "../domain/reminders.mjs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function syncReminders(settings, context = {}) {
  const granted = await ensureNotificationPermission();
  if (!granted) return { ok: false, reason: "permission_denied" };

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const toSchedule = enabledReminders(settings);
  for (const r of toSchedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: r.title,
        body: buildReminderBody(r.id, context),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
  }
  return { ok: true, scheduledCount: toSchedule.length };
}

export async function spikeTestNotification() {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    console.warn("Notification permission denied");
    return false;
  }
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "LivFit spike test",
      body: "If you see this ~5s after tapping, the trigger syntax works.",
    },
    trigger: { type: "timeInterval", seconds: 5, repeats: false },
  });
  return true;
}

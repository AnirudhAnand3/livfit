export const REMINDER_TYPES = {
  workout: { id: "workout", title: "Time to train 💪", defaultHour: 18, defaultMinute: 0 },
  food_log: { id: "food_log", title: "Log your meals 🍽️", defaultHour: 21, defaultMinute: 0 },
  wind_down: { id: "wind_down", title: "Close out your day", defaultHour: 22, defaultMinute: 30 },
};

export function defaultReminderSettings() {
  return {
    workout: { enabled: true, hour: REMINDER_TYPES.workout.defaultHour, minute: REMINDER_TYPES.workout.defaultMinute },
    food_log: { enabled: true, hour: REMINDER_TYPES.food_log.defaultHour, minute: REMINDER_TYPES.food_log.defaultMinute },
    wind_down: { enabled: false, hour: REMINDER_TYPES.wind_down.defaultHour, minute: REMINDER_TYPES.wind_down.defaultMinute },
  };
}

export function buildReminderBody(typeId, context = {}) {
  if (typeId === "workout") {
    return context.sessionName ? `${context.sessionName} is on today's plan.` : "Your session is ready.";
  }
  if (typeId === "food_log") {
    return "A quick log keeps your targets accurate.";
  }
  if (typeId === "wind_down") {
    return "Check your progress and log anything you missed.";
  }
  return "";
}

export function enabledReminders(settings) {
  return Object.keys(REMINDER_TYPES)
    .filter((id) => settings[id]?.enabled)
    .map((id) => ({
      id,
      title: REMINDER_TYPES[id].title,
      hour: settings[id].hour,
      minute: settings[id].minute,
    }));
}

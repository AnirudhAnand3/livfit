import AsyncStorage from "@react-native-async-storage/async-storage";
import { dateKey } from "../../domain/foodLog.mjs";

const PLAN_KEY = "livfit:onboardingResult";
const FOOD_PREFIX = "livfit:foodLog:";
const REMINDERS_KEY = "livfit:reminderSettings";
const WORKOUT_COMPLETIONS_KEY = "livfit:workoutCompletions";
const UID_KEY = "livfit:uid";

export async function savePlanData({ profile, targets, plan }) {
  try {
    await AsyncStorage.setItem(PLAN_KEY, JSON.stringify({ profile, targets, plan, savedAt: Date.now() }));
    return true;
  } catch (e) {
    console.warn("savePlanData failed", e);
    return false;
  }
}

export async function loadPlanData() {
  try {
    const raw = await AsyncStorage.getItem(PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadPlanData failed", e);
    return null;
  }
}

export async function clearPlanData() {
  try {
    await AsyncStorage.removeItem(PLAN_KEY);
    return true;
  } catch (e) {
    console.warn("clearPlanData failed", e);
    return false;
  }
}

export async function loadFoodLog(date = new Date()) {
  try {
    const raw = await AsyncStorage.getItem(FOOD_PREFIX + dateKey(date));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadFoodLog failed", e);
    return [];
  }
}

export async function saveFoodLog(entries, date = new Date()) {
  try {
    await AsyncStorage.setItem(FOOD_PREFIX + dateKey(date), JSON.stringify(entries));
    return true;
  } catch (e) {
    console.warn("saveFoodLog failed", e);
    return false;
  }
}

export async function addFoodEntry(entry, date = new Date()) {
  const existing = await loadFoodLog(date);
  const updated = [...existing, entry];
  await saveFoodLog(updated, date);
  return updated;
}

export async function removeFoodEntry(index, date = new Date()) {
  const existing = await loadFoodLog(date);
  const updated = existing.filter((_, i) => i !== index);
  await saveFoodLog(updated, date);
  return updated;
}

export async function loadReminderSettings() {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadReminderSettings failed", e);
    return null;
  }
}

export async function saveReminderSettings(settings) {
  try {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.warn("saveReminderSettings failed", e);
    return false;
  }
}

export async function loadWorkoutCompletions() {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_COMPLETIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadWorkoutCompletions failed", e);
    return [];
  }
}

export async function logWorkoutCompletion(date = new Date()) {
  try {
    const key = dateKey(date);
    const existing = await loadWorkoutCompletions();
    if (existing.includes(key)) return existing; // already logged today, no duplicate
    const updated = [...existing, key];
    await AsyncStorage.setItem(WORKOUT_COMPLETIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("logWorkoutCompletion failed", e);
    return [];
  }
}

export async function saveUid(uid) {
  try {
    await AsyncStorage.setItem(UID_KEY, uid);
    return true;
  } catch (e) {
    console.warn("saveUid failed", e);
    return false;
  }
}

export async function loadUid() {
  try {
    return await AsyncStorage.getItem(UID_KEY);
  } catch (e) {
    console.warn("loadUid failed", e);
    return null;
  }
}

export async function clearUid() {
  try {
    await AsyncStorage.removeItem(UID_KEY);
    return true;
  } catch (e) {
    console.warn("clearUid failed", e);
    return false;
  }
}

export async function clearAllUserData() {
  try {
    await AsyncStorage.removeItem(PLAN_KEY);
    await AsyncStorage.removeItem(WORKOUT_COMPLETIONS_KEY);
    await AsyncStorage.removeItem(REMINDERS_KEY);
    const allKeys = await AsyncStorage.getAllKeys();
    const foodKeys = allKeys.filter((k) => k.startsWith(FOOD_PREFIX));
    if (foodKeys.length) await AsyncStorage.multiRemove(foodKeys);
    return true;
  } catch (e) {
    console.warn("clearAllUserData failed", e);
    return false;
  }
}

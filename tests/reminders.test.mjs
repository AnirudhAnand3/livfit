import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultReminderSettings, buildReminderBody, enabledReminders } from "../src/domain/reminders.mjs";

test("defaultReminderSettings: workout and food_log enabled, wind_down off by default", () => {
  const s = defaultReminderSettings();
  assert.equal(s.workout.enabled, true);
  assert.equal(s.food_log.enabled, true);
  assert.equal(s.wind_down.enabled, false);
});

test("buildReminderBody includes session name for workout when given", () => {
  const body = buildReminderBody("workout", { sessionName: "Push" });
  assert.match(body, /Push/);
});

test("buildReminderBody falls back for workout without context", () => {
  const body = buildReminderBody("workout", {});
  assert.equal(body, "Your session is ready.");
});

test("enabledReminders only returns enabled types", () => {
  const settings = defaultReminderSettings();
  settings.wind_down.enabled = true;
  const list = enabledReminders(settings);
  assert.equal(list.length, 3);
  assert.ok(list.some((r) => r.id === "wind_down"));
});

test("enabledReminders excludes disabled types", () => {
  const settings = defaultReminderSettings();
  const list = enabledReminders(settings);
  assert.equal(list.length, 2);
  assert.ok(!list.some((r) => r.id === "wind_down"));
});

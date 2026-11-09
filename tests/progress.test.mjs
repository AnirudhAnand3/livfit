import assert from "node:assert/strict";
import test from "node:test";
import { dateKey } from "../src/domain/foodLog.mjs";
import { lastNDates, computeStreak, computeWeeklyCount } from "../src/domain/progress.mjs";

const today = new Date(2026, 10, 4); // Nov 4, 2026 — fixed reference date for determinism

function daysAgo(n, base = today) {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  return d;
}

test("lastNDates returns n dates ending today, oldest first", () => {
  const dates = lastNDates(7, today);
  assert.equal(dates.length, 7);
  assert.equal(dateKey(dates[6]), dateKey(today));
  assert.equal(dateKey(dates[0]), dateKey(daysAgo(6)));
});

test("computeStreak counts consecutive days ending today when today is logged", () => {
  const keys = [0, 1, 2].map((i) => dateKey(daysAgo(i)));
  assert.equal(computeStreak(keys, today), 3);
});

test("computeStreak does not break when today isn't logged yet", () => {
  const keys = [dateKey(daysAgo(1)), dateKey(daysAgo(2))];
  assert.equal(computeStreak(keys, today), 2);
});

test("computeStreak resets to 0 after a missed day", () => {
  const keys = [dateKey(daysAgo(2))]; // yesterday is missing
  assert.equal(computeStreak(keys, today), 0);
});

test("computeStreak is 0 with no completions at all", () => {
  assert.equal(computeStreak([], today), 0);
});

test("computeWeeklyCount counts only completions within the window", () => {
  const inWindow = dateKey(daysAgo(6));
  const outOfWindow = dateKey(daysAgo(8));
  const keys = [inWindow, outOfWindow, dateKey(today)];
  assert.equal(computeWeeklyCount(keys, today, 7), 2);
});

test("computeWeeklyCount ignores duplicate same-day keys", () => {
  const keys = [dateKey(today), dateKey(today)];
  assert.equal(computeWeeklyCount(keys, today, 7), 2); // not deduped by design — see note below
});

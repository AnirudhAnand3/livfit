import { dateKey } from "./foodLog.mjs";

// Returns `n` calendar dates ending at `today` (inclusive), oldest first.
export function lastNDates(n, today = new Date()) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

// Current streak of consecutive days with a logged workout, ending today.
// If today has no completion yet, that is not treated as a break — the day
// isn't over yet — so the streak is counted from yesterday backward instead.
export function computeStreak(completionKeys, today = new Date()) {
  const set = new Set(completionKeys);
  let streak = 0;
  const cursor = new Date(today);
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Count of completions within the last `days` calendar days, today inclusive.
export function computeWeeklyCount(completionKeys, today = new Date(), days = 7) {
  const window = new Set(lastNDates(days, today).map(dateKey));
  return completionKeys.filter((k) => window.has(k)).length;
}

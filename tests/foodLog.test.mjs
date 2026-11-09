import { test } from "node:test";
import assert from "node:assert/strict";
import { createFoodEntry, computeDailyTotals, computeProgress, dateKey } from "../src/domain/foodLog.mjs";

const sampleFood = { id: "roti", name: "Roti", baseUnit: "1 piece", kcal: 104, protein: 3, carbs: 18, fat: 2.5 };

test("createFoodEntry scales macros by multiplier", () => {
  const entry = createFoodEntry(sampleFood, 2);
  assert.equal(entry.kcal, 208);
  assert.equal(entry.protein, 6);
  assert.equal(entry.carbs, 36);
  assert.equal(entry.fat, 5);
});

test("createFoodEntry defaults multiplier to 1", () => {
  const entry = createFoodEntry(sampleFood);
  assert.equal(entry.kcal, 104);
});

test("createFoodEntry rejects non-positive multiplier", () => {
  assert.throws(() => createFoodEntry(sampleFood, 0));
  assert.throws(() => createFoodEntry(sampleFood, -1));
});

test("createFoodEntry rejects missing food", () => {
  assert.throws(() => createFoodEntry(null, 1));
});

test("computeDailyTotals sums multiple entries", () => {
  const entries = [createFoodEntry(sampleFood, 1), createFoodEntry(sampleFood, 0.5)];
  const totals = computeDailyTotals(entries);
  assert.equal(totals.kcal, 156);
  assert.equal(totals.protein, 4.5);
});

test("computeDailyTotals handles empty array", () => {
  const totals = computeDailyTotals([]);
  assert.deepEqual(totals, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
});

test("computeProgress clamps between 0 and 1", () => {
  const targets = { kcal: 2000, proteinG: 100, carbsG: 250, fatG: 60 };
  const over = computeProgress({ kcal: 3000, protein: 200, carbs: 500, fat: 120 }, targets);
  assert.equal(over.kcal, 1);
  assert.equal(over.protein, 1);
  const under = computeProgress({ kcal: 500, protein: 20, carbs: 50, fat: 10 }, targets);
  assert.equal(under.kcal, 0.25);
});

test("dateKey formats as YYYY-MM-DD", () => {
  const d = new Date("2026-03-15T10:00:00Z");
  assert.equal(dateKey(d), "2026-03-15");
});

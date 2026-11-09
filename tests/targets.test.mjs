import assert from "node:assert/strict";
import test from "node:test";
import {
  bmrMifflin,
  CALORIE_FLOOR,
  computeTargets,
} from "../src/domain/targets.mjs";

const man = {
  sex: "male",
  age: 30,
  weightKg: 80,
  heightCm: 180,
  goal: "maintenance",
  daysPerWeek: 4,
};

test("Mifflin-St Jeor: male reference value", () => {
  assert.equal(bmrMifflin(man), 1780);
});

test("Mifflin-St Jeor: female reference value", () => {
  assert.equal(
    bmrMifflin({ sex: "female", age: 25, weightKg: 60, heightCm: 165 }),
    1345.25,
  );
});

test("under-18 is rejected (adults only)", () => {
  assert.throws(() => computeTargets({ ...man, age: 17 }), /adults/);
});

test("invalid input is rejected", () => {
  assert.throws(() => computeTargets({ ...man, goal: "bulk" }), /goal/);
  assert.throws(() => computeTargets({ ...man, weightKg: 0 }), /positive/);
  assert.throws(() => computeTargets({ ...man, sex: "x" }), /sex/);
});

test("fat loss is below maintenance, gain is above", () => {
  const m = computeTargets(man);
  const f = computeTargets({ ...man, goal: "fat_loss" });
  const g = computeTargets({ ...man, goal: "muscle_gain" });
  assert.ok(f.kcal < m.kcal && m.kcal < g.kcal);
});

test("deficit never exceeds 25% of TDEE", () => {
  const f = computeTargets({ ...man, goal: "fat_loss" });
  assert.ok(f.kcal >= f.tdee * 0.75 - 1);
});

test("calorie floor is applied for small people on fat loss", () => {
  const t = computeTargets({
    sex: "female",
    age: 50,
    weightKg: 45,
    heightCm: 150,
    goal: "fat_loss",
    daysPerWeek: 0,
  });
  assert.equal(t.kcal, CALORIE_FLOOR.female);
});

test("protein stays within 1.6-2.2 g/kg for normal inputs", () => {
  for (const goal of ["fat_loss", "muscle_gain", "athletic", "maintenance"]) {
    const t = computeTargets({ ...man, goal });
    const perKg = t.proteinG / man.weightKg;
    assert.ok(perKg >= 1.55 && perKg <= 2.25, goal + " " + perKg);
  }
});

test("macros are non-negative and roughly add up to calories", () => {
  const t = computeTargets({ ...man, weightKg: 150, goal: "fat_loss" });
  assert.ok(t.carbsG >= 0 && t.proteinG >= 0 && t.fatG >= 0);
  const sum = t.proteinG * 4 + t.carbsG * 4 + t.fatG * 9;
  assert.ok(Math.abs(sum - t.kcal) <= 15, "sum " + sum + " vs " + t.kcal);
});

test("activityFactor and goalMultiplier are exposed and correct", () => {
  const m = computeTargets(man);
  assert.equal(m.activityFactor, 1.55);
  assert.equal(m.goalMultiplier, 1);
  const f = computeTargets({ ...man, goal: "fat_loss" });
  assert.equal(f.goalMultiplier, 0.8);
  const g = computeTargets({ ...man, goal: "muscle_gain" });
  assert.equal(g.goalMultiplier, 1.1);
});

test("floorApplied is false for a normal-sized adult at maintenance", () => {
  const m = computeTargets(man);
  assert.equal(m.floorApplied, false);
  assert.equal(m.floorValue, null);
});

test("floorApplied is true when the floor actually raises kcal", () => {
  const t = computeTargets({
    sex: "female",
    age: 50,
    weightKg: 45,
    heightCm: 150,
    goal: "fat_loss",
    daysPerWeek: 0,
  });
  assert.equal(t.floorApplied, true);
  assert.equal(t.floorValue, CALORIE_FLOOR.female);
});

test("preFloorKcal reflects the goal-adjusted value before any floor/cap", () => {
  const m = computeTargets(man);
  assert.equal(m.preFloorKcal, m.tdee); // maintenance: no goal adjustment
});

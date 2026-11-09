import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePlan } from "../src/domain/plan.mjs";

const base = { goal: "muscle_gain", daysPerWeek: 4, equipment: "full_gym", limitations: [] };

test("day count matches daysPerWeek band", () => {
  const plan = generatePlan(base, {});
  assert.equal(plan.sessions.length, 4);
});

test("3-day plan uses FullBody split", () => {
  const plan = generatePlan({ ...base, daysPerWeek: 3 }, {});
  assert.equal(plan.sessions.length, 3);
  assert.equal(plan.sessions[0].name, "FullBodyA");
});

test("excluded category never appears for knee limitation", () => {
  const plan = generatePlan({ ...base, limitations: ["knee"] }, {});
  const categories = plan.sessions.flatMap((s) =>
    s.exercises.filter((e) => e.type === "exercise").map((e) => e.category)
  );
  assert.ok(!categories.includes("squat"));
  assert.ok(!categories.includes("lunge"));
});

test("mobility suggestion added exactly once per limitation", () => {
  const plan = generatePlan({ ...base, limitations: ["knee"] }, {});
  const mobilityCount = plan.sessions
    .flatMap((s) => s.exercises)
    .filter((e) => e.type === "mobility").length;
  assert.equal(mobilityCount, 1);
});

test("fat_loss goal adds a finisher", () => {
  const plan = generatePlan({ ...base, goal: "fat_loss" }, {});
  const hasFinisher = plan.sessions.some((s) => s.exercises.some((e) => e.type === "finisher"));
  assert.ok(hasFinisher);
});

test("rationale is non-empty and mentions equipment", () => {
  const plan = generatePlan(base, {});
  assert.ok(plan.rationale.length > 0);
  assert.ok(plan.rationale.some((r) => r.includes("full_gym")));
});

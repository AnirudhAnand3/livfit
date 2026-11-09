import exercises from "../data/exercises.json" with { type: "json" };
import { LIMITATIONS, getExcludedCategories } from "./limitations.mjs";
import { splitForDaysPerWeek, DAY_TEMPLATES, GOAL_SCHEMES } from "./planTemplates.mjs";

export function generatePlan(profile, targets) {
  const { goal, daysPerWeek, equipment, limitations = [] } = profile;
  const scheme = GOAL_SCHEMES[goal];
  if (!scheme) throw new Error(`Unknown goal: ${goal}`);

  const pool = exercises.filter((e) => e.equipment === equipment);
  const excluded = getExcludedCategories(limitations);

  const rationale = [];
  rationale.push(`${goal.replace("_", " ")} goal → ${scheme.sets} sets x ${scheme.reps} reps, ${scheme.restSec}s rest.`);

  const mobilityAdded = new Set();
  const sessions = splitForDaysPerWeek(daysPerWeek).map((dayKey, idx) => {
    const slots = DAY_TEMPLATES[dayKey];
    const sessionExercises = [];
    const usedIds = new Set();

    slots.forEach((category) => {
      if (excluded.has(category)) {
        const limitation = limitations.find((l) =>
          LIMITATIONS[l]?.excludeCategories.includes(category)
        );
        if (limitation && !mobilityAdded.has(limitation)) {
          const def = LIMITATIONS[limitation];
          rationale.push(`${def.note} → ${category} training swapped for ${def.mobility.name}.`);
          sessionExercises.push({
            type: "mobility",
            name: def.mobility.name,
            desc: def.mobility.desc,
          });
          mobilityAdded.add(limitation);
        }
        return;
      }
      const candidates = pool.filter((e) => e.category === category && !usedIds.has(e.id));
      if (candidates.length === 0) return;
      const pick = candidates[idx % candidates.length];
      usedIds.add(pick.id);
      sessionExercises.push({
        type: "exercise",
        exerciseId: pick.id,
        name: pick.name,
        category: pick.category,
        sets: scheme.sets,
        reps: scheme.reps,
        restSec: scheme.restSec,
      });
    });

    if (scheme.finisher) {
      sessionExercises.push({
        type: "finisher",
        name: "Conditioning finisher",
        desc: "5 min: 30s work / 30s rest, bodyweight circuit.",
      });
    }

    return { day: idx + 1, name: dayKey, exercises: sessionExercises };
  });

  rationale.push(`Equipment: ${equipment} → exercise pool restricted accordingly.`);
  if (limitations.length === 0) rationale.push("No limitations reported.");

  return { goal, daysPerWeek, equipment, sessions, rationale };
}

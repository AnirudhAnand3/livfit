// Pure nutrition maths for LivFit. No React, no storage, no network.
// Kept pure so it can be unit-tested with plain Node (see tests/targets.test.js).

// Calorie floors: 1200 (female) / 1500 (male) are the values commonly quoted by
// calculator sites. TODO(verify): confirm against a primary guideline before release.
export const CALORIE_FLOOR = { female: 1200, male: 1500 };
export const MAX_DEFICIT = 0.25; // never cut more than 25% of TDEE
const MIN_AGE = 18; // LivFit is adults-only

const GOALS = ["muscle_gain", "fat_loss", "athletic", "maintenance"];

// Mifflin-St Jeor (1990): kcal/day at rest.
export function bmrMifflin({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// ASSUMPTION: activity is approximated from planned training days per week.
// Tune later with real feedback; the multipliers are the standard ones.
export function activityFactor(daysPerWeek) {
  if (daysPerWeek <= 1) return 1.2;
  if (daysPerWeek <= 3) return 1.375;
  if (daysPerWeek <= 5) return 1.55;
  return 1.725;
}

function validate(p) {
  if (!p || typeof p !== "object") throw new Error("profile required");
  if (!(p.age >= MIN_AGE)) throw new Error("LivFit is for adults (18+)");
  if (p.sex !== "male" && p.sex !== "female")
    throw new Error("sex must be male or female");
  if (!(p.weightKg > 0) || !(p.heightCm > 0))
    throw new Error("weight and height must be positive");
  if (!GOALS.includes(p.goal)) throw new Error("unknown goal: " + p.goal);
  if (!(p.daysPerWeek >= 0)) throw new Error("daysPerWeek required");
}

// Protein g per kg bodyweight, kept inside the 1.6-2.2 range from the evidence review.
const PROTEIN_PER_KG = {
  fat_loss: 2.0,
  muscle_gain: 1.8,
  athletic: 1.6,
  maintenance: 1.6,
};

export function computeTargets(profile) {
  validate(profile);
  const rationale = [];
  const bmr = bmrMifflin(profile);
  const actFactor = activityFactor(profile.daysPerWeek);
  const tdee = bmr * actFactor;

  let kcal = tdee;
  let goalMultiplier = 1;
  if (profile.goal === "fat_loss") {
    goalMultiplier = 0.8; // 20% deficit, below the 25% cap
    kcal = tdee * goalMultiplier;
    rationale.push(
      "Fat loss: moderate 20% deficit to protect muscle and energy.",
    );
  } else if (profile.goal === "muscle_gain") {
    goalMultiplier = 1.1; // small surplus keeps fat gain low
    kcal = tdee * goalMultiplier;
    rationale.push("Muscle gain: small 10% surplus to limit fat gain.");
  } else {
    rationale.push("Calories set at maintenance.");
  }

  const preFloorKcal = kcal;
  const floor = CALORIE_FLOOR[profile.sex];
  let floorApplied = false;
  if (kcal < floor) {
    kcal = floor;
    floorApplied = true;
    rationale.push("Raised to the minimum daily intake of " + floor + " kcal.");
  }
  // Defensive: even after rounding, a deficit must never exceed the cap.
  let deficitCapApplied = false;
  if (kcal < tdee * (1 - MAX_DEFICIT)) {
    kcal = Math.max(floor, tdee * (1 - MAX_DEFICIT));
    deficitCapApplied = true;
  }

  // Protein, capped at 40% of calories so tiny budgets stay sensible.
  let proteinG = PROTEIN_PER_KG[profile.goal] * profile.weightKg;
  proteinG = Math.min(proteinG, (0.4 * kcal) / 4);
  const fatG = (0.25 * kcal) / 9;
  const carbsG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4);

  rationale.push(
    "Protein " +
      (proteinG / profile.weightKg).toFixed(1) +
      " g per kg bodyweight.",
  );
  rationale.push(
    "These are estimates (typically within about 10-15%); adjust from your real progress.",
  );

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: Math.round(kcal),
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbsG: Math.round(carbsG),
    rationale,
    activityFactor: actFactor,
    goal: profile.goal,
    goalMultiplier,
    preFloorKcal: Math.round(preFloorKcal),
    floorApplied,
    floorValue: floorApplied ? floor : null,
    deficitCapApplied,
  };
}

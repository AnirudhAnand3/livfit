export const SPLITS = {
  3: ["FullBodyA", "FullBodyB", "FullBodyC"],
  4: ["Push", "Pull", "Legs", "FullBody"],
  5: ["Push", "Pull", "Legs", "Upper", "Lower"],
};

export function splitForDaysPerWeek(daysPerWeek) {
  if (daysPerWeek <= 3) return SPLITS[3];
  if (daysPerWeek === 4) return SPLITS[4];
  return SPLITS[5];
}

// Each day = ordered list of category slots to fill from the exercise pool
export const DAY_TEMPLATES = {
  FullBodyA: ["squat", "push_horizontal", "pull_horizontal", "core"],
  FullBodyB: ["hinge", "push_vertical", "pull_vertical", "core"],
  FullBodyC: ["lunge", "push_horizontal", "pull_horizontal", "carry"],
  FullBody: ["squat", "push_horizontal", "pull_vertical", "core"],
  Push: ["push_horizontal", "push_vertical", "push_horizontal", "core"],
  Pull: ["pull_horizontal", "pull_vertical", "hinge", "core"],
  Legs: ["squat", "hinge", "lunge", "carry"],
  Upper: ["push_horizontal", "pull_horizontal", "push_vertical", "pull_vertical"],
  Lower: ["squat", "hinge", "lunge", "core"],
};

export const GOAL_SCHEMES = {
  muscle_gain: { sets: 4, reps: "8-12", restSec: 75, finisher: false },
  fat_loss: { sets: 3, reps: "12-15", restSec: 45, finisher: true },
  athletic: { sets: 4, reps: "5-8", restSec: 120, finisher: false },
  maintenance: { sets: 3, reps: "8-10", restSec: 60, finisher: false },
};

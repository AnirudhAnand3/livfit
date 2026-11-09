export function createFoodEntry(food, multiplier = 1) {
  if (!food) throw new Error("food is required");
  if (multiplier <= 0) throw new Error("multiplier must be positive");
  return {
    foodId: food.id,
    name: food.name,
    baseUnit: food.baseUnit,
    multiplier,
    kcal: Math.round(food.kcal * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
    loggedAt: Date.now(),
  };
}

export function computeDailyTotals(entries = []) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: Math.round((acc.protein + e.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.fat) * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function computeProgress(totals, targets) {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  return {
    kcal: clamp(targets.kcal > 0 ? totals.kcal / targets.kcal : 0),
    protein: clamp(targets.proteinG > 0 ? totals.protein / targets.proteinG : 0),
    carbs: clamp(targets.carbsG > 0 ? totals.carbs / targets.carbsG : 0),
    fat: clamp(targets.fatG > 0 ? totals.fat / targets.fatG : 0),
  };
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

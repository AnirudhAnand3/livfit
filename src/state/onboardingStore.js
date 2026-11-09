import { create } from "zustand";

export const useOnboarding = create((set) => ({
  goal: null,
  daysPerWeek: 4,
  minutesPerDay: 45,
  age: null,
  sex: null,
  weightKg: null,
  heightCm: null,
  equipment: "full_gym",
  diet: "non_veg",
  limitations: [],
  targets: null,
  plan: null,
  setField: (key, value) => set({ [key]: value }),
  reset: () => set({
    goal: null, daysPerWeek: 4, minutesPerDay: 45,
    age: null, sex: null, weightKg: null, heightCm: null,
    equipment: "full_gym", diet: "non_veg", limitations: [],
    targets: null, plan: null,
  }),
}));

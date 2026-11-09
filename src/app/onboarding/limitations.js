import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../state/onboardingStore";
import { colors, spacing, type, radius } from "../../ui/tokens";
import { computeTargets } from "../../domain/targets.mjs";
import { generatePlan } from "../../domain/plan.mjs";
import { savePlanData, loadUid } from "../../data/local/storage.mjs";
import { syncProfileToCloud, syncPlanToCloud } from "../../data/cloud/firestore.mjs";

const OPTIONS = [
  { id: "knee", label: "Knee issue" },
  { id: "lower_back", label: "Lower back issue" },
  { id: "shoulder", label: "Shoulder issue" },
  { id: "wrist", label: "Wrist issue" },
  { id: "heart_condition", label: "Heart condition" },
];

export default function LimitationsScreen() {
  const router = useRouter();
  const store = useOnboarding();
  const { limitations, setField } = store;

  const toggle = (id) => {
    if (id === "none") {
      setField("limitations", []);
      return;
    }
    const next = limitations.includes(id)
      ? limitations.filter((l) => l !== id)
      : [...limitations.filter((l) => l !== "none"), id];
    setField("limitations", next);
  };

  const handleSubmit = async () => {
    if (limitations.includes("heart_condition")) {
      router.push("/onboarding/safety-check");
      return;
    }
    const profile = {
      goal: store.goal,
      daysPerWeek: store.daysPerWeek,
      minutesPerDay: store.minutesPerDay,
      age: store.age,
      sex: store.sex,
      heightCm: store.heightCm,
      weightKg: store.weightKg,
      equipment: store.equipment,
      diet: store.diet,
      limitations: limitations.filter((l) => l !== "heart_condition"),
    };
    const targets = computeTargets(profile);
    const plan = generatePlan(profile, targets);
    setField("targets", targets);
    setField("plan", plan);
    await savePlanData({ profile, targets, plan });
    loadUid().then(uid => {
      if (uid) {
        syncProfileToCloud(uid, { profile, targets });
        syncPlanToCloud(uid, plan);
      }
    });
    router.push("/plan-reveal");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 5 of 5</Text>
      <Text style={styles.title}>Any limitations?</Text>
      <Text style={styles.sub}>Select all that apply. Be honest — we'll adjust the plan.</Text>

      {OPTIONS.map((o) => (
        <Pressable
          key={o.id}
          style={[styles.card, limitations.includes(o.id) && styles.cardSelected]}
          onPress={() => toggle(o.id)}
        >
          <Text style={[styles.label, limitations.includes(o.id) && styles.labelSelected]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
      <Pressable
        style={[styles.card, limitations.length === 0 && styles.cardSelected]}
        onPress={() => toggle("none")}
      >
        <Text style={[styles.label, limitations.length === 0 && styles.labelSelected]}>
          None of these
        </Text>
      </Pressable>

      <Pressable style={styles.next} onPress={handleSubmit}>
        <Text style={styles.nextText}>Create my plan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: colors.bg },
  step: { ...type.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...type.h2, color: colors.text, marginBottom: spacing.sm },
  sub: { ...type.caption, color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary },
  label: { ...type.body, color: colors.text, fontWeight: "700" },
  labelSelected: { color: colors.primary },
  next: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl,
  },
  nextText: { ...type.body, color: colors.bg, fontWeight: "700" },
});


import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../state/onboardingStore";
import { colors, spacing, type, radius } from "../../ui/tokens";

const GOALS = [
  { id: "muscle_gain", label: "Build Muscle", desc: "Lean hypertrophy, strength and size" },
  { id: "fat_loss",   label: "Lose Fat",     desc: "Sustainable deficit, keep the muscle" },
  { id: "athletic",   label: "Get Athletic", desc: "Mobility, conditioning, sports performance" },
  { id: "maintenance",label: "Maintain",     desc: "Stay consistent, experienced lifter" },
];

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setField } = useOnboarding();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step 1 of 5</Text>
      <Text style={styles.title}>What is your goal?</Text>
      {GOALS.map((g) => (
        <Pressable
          key={g.id}
          style={[styles.card, goal === g.id && styles.cardSelected]}
          onPress={() => setField("goal", g.id)}
        >
          <Text style={[styles.label, goal === g.id && styles.labelSelected]}>{g.label}</Text>
          <Text style={styles.desc}>{g.desc}</Text>
        </Pressable>
      ))}
      <Pressable
        style={[styles.next, !goal && styles.nextDisabled]}
        disabled={!goal}
        onPress={() => router.push("/onboarding/schedule")}
      >
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xxl },
  step: { ...type.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...type.h2, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary },
  label: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: 2 },
  labelSelected: { color: colors.primary },
  desc: { ...type.caption, color: colors.textMuted },
  next: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg,
  },
  nextDisabled: { opacity: 0.4 },
  nextText: { ...type.body, color: colors.bg, fontWeight: "700" },
});

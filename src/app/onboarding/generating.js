import { View, Text, StyleSheet } from "react-native";
import { useOnboarding } from "../../state/onboardingStore";
import { computeTargets } from "../../domain/targets";
import { colors, spacing, type } from "../../ui/tokens";

export default function Generating() {
  const { age, sex, weightKg, heightCm, goal, daysPerWeek } = useOnboarding();
  let targets, error;
  try {
    targets = computeTargets({ age, sex, weightKg, heightCm, goal, daysPerWeek });
  } catch (e) {
    error = e.message;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your targets</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text style={styles.stat}>{targets.kcal} kcal/day</Text>
          <Text style={styles.stat}>{targets.proteinG}g protein</Text>
          {targets.rationale.map((r, i) => (
            <Text key={i} style={styles.reason}>• {r}</Text>
          ))}
        </>
      )}
      <Text style={styles.note}>Plan generator and reveal screen: next milestone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { ...type.h2, color: colors.text, marginBottom: spacing.lg },
  stat: { ...type.h1, color: colors.primary, marginBottom: spacing.xs },
  error: { ...type.body, color: colors.warning },
  reason: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  note: { ...type.caption, color: colors.textMuted, marginTop: spacing.xl },
});

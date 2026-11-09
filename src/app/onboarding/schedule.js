import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../state/onboardingStore";
import { colors, spacing, type, radius } from "../../ui/tokens";

const DAYS = [3, 4, 5, 6];
const MINUTES = [30, 45, 60, 75];

export default function ScheduleScreen() {
  const router = useRouter();
  const { daysPerWeek, minutesPerDay, setField } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 2 of 5</Text>
      <Text style={styles.title}>Your schedule</Text>

      <Text style={styles.label}>Days per week</Text>
      <View style={styles.row}>
        {DAYS.map((d) => (
          <Pressable
            key={d}
            style={[styles.chip, daysPerWeek === d && styles.chipSelected]}
            onPress={() => setField("daysPerWeek", d)}
          >
            <Text style={[styles.chipText, daysPerWeek === d && styles.chipTextSelected]}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Minutes per session</Text>
      <View style={styles.row}>
        {MINUTES.map((m) => (
          <Pressable
            key={m}
            style={[styles.chip, minutesPerDay === m && styles.chipSelected]}
            onPress={() => setField("minutesPerDay", m)}
          >
            <Text style={[styles.chipText, minutesPerDay === m && styles.chipTextSelected]}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.next} onPress={() => router.push("/onboarding/body")}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: colors.bg },
  step: { ...type.caption, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...type.h2, color: colors.text, marginBottom: spacing.lg },
  label: { ...type.body, color: colors.text, fontWeight: "700", marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "22" },
  chipText: { ...type.body, color: colors.textMuted },
  chipTextSelected: { color: colors.primary, fontWeight: "700" },
  next: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl,
  },
  nextText: { ...type.body, color: colors.bg, fontWeight: "700" },
});

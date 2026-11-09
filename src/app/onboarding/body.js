import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../state/onboardingStore";
import { colors, spacing, type, radius } from "../../ui/tokens";

export default function BodyScreen() {
  const router = useRouter();
  const { age, sex, heightCm, weightKg, setField } = useOnboarding();

  const canNext = age && sex && heightCm && weightKg;

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3 of 5</Text>
      <Text style={styles.title}>About you</Text>

      <Text style={styles.label}>Sex</Text>
      <View style={styles.row}>
        {["male", "female"].map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, sex === s && styles.chipSelected]}
            onPress={() => setField("sex", s)}
          >
            <Text style={[styles.chipText, sex === s && styles.chipTextSelected]}>
              {s[0].toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="e.g. 21"
        placeholderTextColor={colors.textMuted}
        value={age ? String(age) : ""}
        onChangeText={(v) => setField("age", v ? parseInt(v, 10) : null)}
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="e.g. 175"
        placeholderTextColor={colors.textMuted}
        value={heightCm ? String(heightCm) : ""}
        onChangeText={(v) => setField("heightCm", v ? parseInt(v, 10) : null)}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="e.g. 70"
        placeholderTextColor={colors.textMuted}
        value={weightKg ? String(weightKg) : ""}
        onChangeText={(v) => setField("weightKg", v ? parseInt(v, 10) : null)}
      />

      <Pressable
        style={[styles.next, !canNext && styles.nextDisabled]}
        disabled={!canNext}
        onPress={() => router.push("/onboarding/equipment")}
      >
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
  row: { flexDirection: "row", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "22" },
  chipText: { ...type.body, color: colors.textMuted },
  chipTextSelected: { color: colors.primary, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    color: colors.text, ...type.body,
  },
  next: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl,
  },
  nextDisabled: { opacity: 0.4 },
  nextText: { ...type.body, color: colors.bg, fontWeight: "700" },
});

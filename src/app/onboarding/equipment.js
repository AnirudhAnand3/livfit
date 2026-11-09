import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../state/onboardingStore";
import { colors, spacing, type, radius } from "../../ui/tokens";

const EQUIPMENT = [
  { id: "full_gym", label: "Full Gym", enabled: true },
  { id: "home_basic", label: "Home / Basic", enabled: false },
  { id: "bodyweight", label: "Bodyweight Only", enabled: false },
];
const DIETS = [
  { id: "veg", label: "Vegetarian" },
  { id: "eggetarian", label: "Eggetarian" },
  { id: "non_veg", label: "Non-Vegetarian" },
];

export default function EquipmentScreen() {
  const router = useRouter();
  const { equipment, diet, setField } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 4 of 5</Text>
      <Text style={styles.title}>Equipment & diet</Text>

      <Text style={styles.label}>Equipment access</Text>
      {EQUIPMENT.map((e) => (
        <Pressable
          key={e.id}
          disabled={!e.enabled}
          style={[
            styles.card,
            equipment === e.id && styles.cardSelected,
            !e.enabled && styles.cardDisabled,
          ]}
          onPress={() => e.enabled && setField("equipment", e.id)}
        >
          <Text style={[styles.label2, equipment === e.id && styles.labelSelected]}>
            {e.label}{!e.enabled ? " (coming soon)" : ""}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.label}>Diet</Text>
      <View style={styles.row}>
        {DIETS.map((d) => (
          <Pressable
            key={d.id}
            style={[styles.chip, diet === d.id && styles.chipSelected]}
            onPress={() => setField("diet", d.id)}
          >
            <Text style={[styles.chipText, diet === d.id && styles.chipTextSelected]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.next} onPress={() => router.push("/onboarding/limitations")}>
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
  label2: { ...type.body, color: colors.text, fontWeight: "700" },
  labelSelected: { color: colors.primary },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary },
  cardDisabled: { opacity: 0.4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
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

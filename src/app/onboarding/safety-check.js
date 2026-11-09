import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, type, radius } from "../../ui/tokens";

export default function SafetyCheckScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Check with your doctor first</Text>
      <Text style={styles.body}>
        You've flagged a heart condition. LivFit isn't a substitute for medical advice —
        please get clearance from a doctor before starting a new training program.
      </Text>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: colors.bg, alignItems: "center" },
  icon: { fontSize: 48, marginBottom: spacing.lg },
  title: { ...type.h2, color: colors.warning, textAlign: "center", marginBottom: spacing.md },
  body: { ...type.body, color: colors.text, textAlign: "center", marginBottom: spacing.xl },
  back: {
    borderRadius: 999, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  backText: { ...type.body, color: colors.text, fontWeight: "700" },
});

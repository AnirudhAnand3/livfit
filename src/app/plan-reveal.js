import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useOnboarding } from "../state/onboardingStore";
import { colors, spacing, type, radius } from "../ui/tokens";

export default function PlanRevealScreen() {
  const router = useRouter();
  const { targets, plan } = useOnboarding();

  if (!targets || !plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No plan generated yet</Text>
        <Pressable style={styles.next} onPress={() => router.replace("/onboarding")}>
          <Text style={styles.nextText}>Start onboarding</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
      <Animated.Text entering={FadeIn.duration(300)} style={styles.title}>
        Your plan is ready
      </Animated.Text>

      <Animated.View entering={FadeInDown.duration(350).delay(100)} style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.kcal}</Text>
          <Text style={styles.statLabel}>kcal/day</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.proteinG}g</Text>
          <Text style={styles.statLabel}>protein</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.carbsG}g</Text>
          <Text style={styles.statLabel}>carbs</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.fatG}g</Text>
          <Text style={styles.statLabel}>fat</Text>
        </View>
      </Animated.View>

      <Text style={styles.sectionTitle}>Why these numbers</Text>
      {targets.rationale.map((r, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(300).delay(200 + i * 80)} style={styles.rationaleRow}>
          <Text style={styles.rationaleBullet}>•</Text>
          <Text style={styles.rationaleText}>{r}</Text>
        </Animated.View>
      ))}

      <Text style={styles.sectionTitle}>Your training split</Text>
      {plan.sessions.map((session, i) => (
        <Animated.View
          key={session.day}
          entering={FadeInDown.duration(350).delay(400 + i * 100)}
          style={styles.sessionCard}
        >
          <Text style={styles.sessionTitle}>Day {session.day} — {session.name}</Text>
          {session.exercises.map((ex, j) => (
            <Text key={j} style={styles.exerciseLine}>
              {ex.type === "exercise"
                ? `• ${ex.name} — ${ex.sets}x${ex.reps}`
                : ex.type === "mobility"
                ? `• ${ex.name} (mobility)`
                : `• ${ex.name}`}
            </Text>
          ))}
        </Animated.View>
      ))}

      <Text style={styles.sectionTitle}>Plan reasoning</Text>
      {plan.rationale.map((r, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(300).delay(700 + i * 80)} style={styles.rationaleRow}>
          <Text style={styles.rationaleBullet}>•</Text>
          <Text style={styles.rationaleText}>{r}</Text>
        </Animated.View>
      ))}

      <Pressable style={styles.next} onPress={() => router.replace("/today")}>
        <Text style={styles.nextText}>Let's go</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  stat: { alignItems: "center" },
  statValue: { ...type.h2, color: colors.primary },
  statLabel: { ...type.caption, color: colors.textMuted },
  sectionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginTop: spacing.lg, marginBottom: spacing.sm },
  rationaleRow: { flexDirection: "row", marginBottom: spacing.xs, paddingRight: spacing.md },
  rationaleBullet: { color: colors.primary, marginRight: spacing.sm },
  rationaleText: { ...type.caption, color: colors.textMuted, flex: 1 },
  sessionCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  sessionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.sm },
  exerciseLine: { ...type.caption, color: colors.textMuted, marginBottom: 2 },
  next: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.xl,
  },
  nextText: { ...type.body, color: colors.bg, fontWeight: "700" },
});

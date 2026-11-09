import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { loadPlanData } from "../../data/local/storage.mjs";
import ExerciseDetailSheet from "../../ui/components/ExerciseDetailSheet";
import { colors, spacing, type, radius } from "../../ui/tokens";

export default function PlanScreen() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [sheetExercise, setSheetExercise] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadPlanData().then((result) => {
        if (!active) return;
        setPlan(result?.plan ?? null);
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!plan) {
    return <View style={styles.center}><Text style={styles.emptyText}>No plan yet</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={styles.title}>Your Plan</Text>
        {plan.sessions.map((session) => (
          <View key={session.day} style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Day {session.day} — {session.name}</Text>
            {session.exercises.map((ex, j) => (
              <Pressable key={j} style={styles.exerciseRow} onPress={() => setSheetExercise(ex)}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                {ex.type === "exercise" && <Text style={styles.exerciseMeta}>{ex.sets}x{ex.reps}</Text>}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
      <ExerciseDetailSheet
        visible={!!sheetExercise}
        exercise={sheetExercise}
        onClose={() => setSheetExercise(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  emptyText: { ...type.body, color: colors.textMuted },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  sessionCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  sessionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.sm },
  exerciseRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  exerciseName: { ...type.body, color: colors.text },
  exerciseMeta: { ...type.caption, color: colors.textMuted },
});

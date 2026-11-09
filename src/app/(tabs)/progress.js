import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { loadPlanData, loadWorkoutCompletions, loadFoodLog } from "../../data/local/storage.mjs";
import { computeStreak, computeWeeklyCount, lastNDates } from "../../domain/progress.mjs";
import { computeDailyTotals, computeProgress, dateKey } from "../../domain/foodLog.mjs";
import ProgressRing from "../../ui/components/ProgressRing";
import { colors, spacing, type, radius } from "../../ui/tokens";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [hasAnyCompletion, setHasAnyCompletion] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(1);
  const [trend, setTrend] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const [planData, completions] = await Promise.all([loadPlanData(), loadWorkoutCompletions()]);
        if (!active) return;

        const target = planData?.profile?.daysPerWeek || planData?.plan?.sessions?.length || 1;
        setWeeklyTarget(target);
        setWeeklyCount(computeWeeklyCount(completions));
        setStreak(computeStreak(completions));
        setHasAnyCompletion(completions.length > 0);

        const targets = planData?.targets ?? null;
        const dates = lastNDates(7);
        const logs = await Promise.all(dates.map((d) => loadFoodLog(d)));
        if (!active) return;

        const builtTrend = dates.map((d, i) => {
          const entries = logs[i];
          const totals = computeDailyTotals(entries);
          const kcalProgress = targets ? computeProgress(totals, targets).kcal : 0;
          return {
            key: dateKey(d),
            label: DAY_LETTERS[d.getDay()],
            progress: kcalProgress,
            hasEntries: entries.length > 0,
          };
        });
        setTrend(builtTrend);
        setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  const weeklyProgress = Math.min(weeklyCount / weeklyTarget, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
      <Text style={styles.title}>Progress</Text>

      <View style={styles.streakCard}>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        {!hasAnyCompletion && (
          <Text style={styles.streakCaption}>Complete a workout to start your streak.</Text>
        )}
      </View>

      <View style={styles.ringCard}>
        <ProgressRing
          size={140}
          strokeWidth={12}
          progress={weeklyProgress}
          color={colors.primary}
          value={`${weeklyCount}/${weeklyTarget}`}
          label="sessions this week"
        />
      </View>

      <Text style={styles.sectionTitle}>This week's nutrition</Text>
      <View style={styles.trendRow}>
        {trend.map((day) => (
          <View key={day.key} style={styles.trendBarWrap}>
            <View style={styles.trendTrack}>
              <View
                style={[
                  styles.trendFill,
                  { height: `${(day.hasEntries ? Math.max(day.progress, 0.05) : 0) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.trendLabel}>{day.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  streakCard: {
    alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  streakValue: { ...type.h1, color: colors.primary, fontSize: 48 },
  streakLabel: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  streakCaption: { ...type.caption, color: colors.textMuted, marginTop: spacing.sm, textAlign: "center", paddingHorizontal: spacing.lg },
  ringCard: { alignItems: "center", marginBottom: spacing.xl },
  sectionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.md },
  trendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: spacing.xl },
  trendBarWrap: { alignItems: "center", gap: spacing.xs },
  trendTrack: {
    width: 22, height: 90, borderRadius: radius.sm, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden", justifyContent: "flex-end",
  },
  trendFill: { width: "100%", backgroundColor: colors.primary, borderRadius: radius.sm },
  trendLabel: { ...type.caption, color: colors.textMuted },
});

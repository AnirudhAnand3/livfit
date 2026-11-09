import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { loadPlanData } from "../../data/local/storage.mjs";
import { colors, spacing, type, radius } from "../../ui/tokens";

export default function TodayScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadPlanData().then((result) => {
        if (!active) return;
        if (!result) {
          router.replace("/onboarding");
          return;
        }
        setData(result);
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const { targets, plan } = data;
  const dayIndex = new Date().getDay() % plan.sessions.length;
  const todaySession = plan.sessions[dayIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <View style={styles.card}>
        <Text style={styles.sessionName}>{todaySession.name}</Text>
        <Text style={styles.sessionMeta}>{todaySession.exercises.length} items</Text>
        <Pressable style={styles.startBtn} onPress={() => router.push("/workout-player")}>
          <Text style={styles.startBtnText}>Start Workout</Text>
        </Pressable>
      </View>
      <Pressable style={styles.statsRow} onPress={() => router.push("/nutrition")}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.kcal}</Text>
          <Text style={styles.statLabel}>kcal target</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{targets.proteinG}g</Text>
          <Text style={styles.statLabel}>protein target</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, paddingTop: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  sessionName: { ...type.h2, color: colors.primary, marginBottom: spacing.xs },
  sessionMeta: { ...type.caption, color: colors.textMuted, marginBottom: spacing.md },
  startBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: spacing.sm, alignItems: "center" },
  startBtnText: { ...type.body, color: colors.bg, fontWeight: "700" },
  statsRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: "flex-start" },
  statValue: { ...type.h2, color: colors.text },
  statLabel: { ...type.caption, color: colors.textMuted },
  chevron: { ...type.h2, color: colors.textMuted, marginLeft: "auto" },
});




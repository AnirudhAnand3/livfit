import { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { loadPlanData } from "../data/local/storage.mjs";
import { colors, spacing, type, radius } from "../ui/tokens";

const GOAL_LABELS = {
  fat_loss: "fat loss",
  muscle_gain: "muscle gain",
  athletic: "athletic",
  maintenance: "maintenance",
};

// Counts from `from` to `to` starting `delay` ms after mount, over `duration` ms,
// with ease-out cubic easing. Relies on the parent remounting this component fresh
// (via a changing `key`) each time the cascade should replay — no external state needed.
function CountingNumber({ from, to, duration, delay, suffix = "", style }) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    let cancelled = false;
    let frame;
    const timeoutId = setTimeout(() => {
      const start = Date.now();
      function tick() {
        if (cancelled) return;
        const elapsed = Date.now() - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <Text style={style}>{display}{suffix}</Text>;
}

export default function NutritionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState(null);
  const [animated, setAnimated] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadPlanData().then((data) => {
        if (!active) return;
        setTargets(data?.targets ?? null);
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!targets) {
    return <View style={styles.center}><Text style={styles.emptyText}>Complete onboarding first</Text></View>;
  }

  const replay = () => {
    setAnimated(true);
    setReplayKey((k) => k + 1);
  };

  const StepWrapper = animated ? Animated.View : View;
  const enter = (delay) => (animated ? { entering: FadeInDown.duration(350).delay(delay) } : {});

  const goalLabel = GOAL_LABELS[targets.goal] ?? targets.goal;
  const goalEquationText =
    targets.goalMultiplier === 1
      ? `${targets.tdee} kcal held steady (${goalLabel})`
      : `${targets.tdee} × ${targets.goalMultiplier.toFixed(2)} (${goalLabel})`;
  const showPreFloorStep = targets.preFloorKcal !== targets.kcal;

  // Cascade timing: each number keeps counting from where the previous one landed.
  const T_BMR = 0;
  const T_TDEE = 700;
  const T_GOAL = 1500;
  const T_MACROS = 2300;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Nutrition</Text>
      </View>

      <View key={replayKey} style={{ gap: spacing.sm }}>
        <StepWrapper {...enter(T_BMR)} style={styles.stepCard}>
          <Text style={styles.stepLabel}>Base Metabolic Rate</Text>
          {animated ? (
            <CountingNumber from={0} to={targets.bmr} duration={600} delay={T_BMR} suffix=" kcal" style={styles.stepValue} />
          ) : (
            <Text style={styles.stepValue}>{targets.bmr} kcal</Text>
          )}
          <Text style={styles.stepCaption}>What your body burns at rest.</Text>
        </StepWrapper>

        <StepWrapper {...enter(T_TDEE)} style={styles.stepCard}>
          <Text style={styles.stepLabel}>Total Daily Energy</Text>
          <Text style={styles.equationText}>{targets.bmr} × {targets.activityFactor}</Text>
          {animated ? (
            <CountingNumber from={targets.bmr} to={targets.tdee} duration={650} delay={T_TDEE} suffix=" kcal" style={styles.stepValue} />
          ) : (
            <Text style={styles.stepValue}>{targets.tdee} kcal</Text>
          )}
          <Text style={styles.stepCaption}>Adjusted for your training frequency.</Text>
        </StepWrapper>

        <StepWrapper {...enter(T_GOAL)} style={[styles.stepCard, styles.stepCardPrimary]}>
          <Text style={styles.stepLabelPrimary}>Daily Target</Text>
          <Text style={styles.equationText}>{goalEquationText}</Text>
          {showPreFloorStep && (
            <Text style={styles.equationArrow}>→ {targets.preFloorKcal} kcal</Text>
          )}
          {targets.floorApplied && (
            <Text style={styles.adjustNote}>Raised to the {targets.floorValue} kcal minimum</Text>
          )}
          {targets.deficitCapApplied && !targets.floorApplied && (
            <Text style={styles.adjustNote}>Capped to protect against an excessive deficit</Text>
          )}
          {animated ? (
            <CountingNumber from={targets.tdee} to={targets.kcal} duration={650} delay={T_GOAL} suffix=" kcal" style={styles.stepValuePrimary} />
          ) : (
            <Text style={styles.stepValuePrimary}>{targets.kcal} kcal</Text>
          )}
          <Text style={styles.stepCaptionPrimary}>Adjusted for your goal.</Text>
        </StepWrapper>

        <StepWrapper {...enter(T_MACROS)} style={styles.macroRow}>
          <View style={styles.macroChip}>
            {animated ? (
              <CountingNumber from={0} to={targets.proteinG} duration={450} delay={T_MACROS} suffix="g" style={styles.macroValue} />
            ) : (
              <Text style={styles.macroValue}>{targets.proteinG}g</Text>
            )}
            <Text style={styles.macroLabel}>protein</Text>
          </View>
          <View style={styles.macroChip}>
            {animated ? (
              <CountingNumber from={0} to={targets.carbsG} duration={450} delay={T_MACROS + 60} suffix="g" style={styles.macroValue} />
            ) : (
              <Text style={styles.macroValue}>{targets.carbsG}g</Text>
            )}
            <Text style={styles.macroLabel}>carbs</Text>
          </View>
          <View style={styles.macroChip}>
            {animated ? (
              <CountingNumber from={0} to={targets.fatG} duration={450} delay={T_MACROS + 120} suffix="g" style={styles.macroValue} />
            ) : (
              <Text style={styles.macroValue}>{targets.fatG}g</Text>
            )}
            <Text style={styles.macroLabel}>fat</Text>
          </View>
        </StepWrapper>
      </View>

      <Text style={styles.sectionTitle}>Why these numbers</Text>
      {targets.rationale.map((r, i) => (
        <View key={i} style={styles.rationaleRow}>
          <Text style={styles.rationaleBullet}>•</Text>
          <Text style={styles.rationaleText}>{r}</Text>
        </View>
      ))}

      <Pressable style={styles.replayBtn} onPress={replay}>
        <Text style={styles.replayBtnText}>Show me the math</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  emptyText: { ...type.body, color: colors.textMuted },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg, gap: spacing.md },
  backArrow: { ...type.h2, color: colors.text },
  title: { ...type.h1, color: colors.text },
  stepCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  stepLabel: { ...type.caption, color: colors.textMuted, marginBottom: 4 },
  equationText: { ...type.caption, color: colors.textMuted, marginBottom: 4, letterSpacing: 0.3 },
  equationArrow: { ...type.caption, color: colors.textMuted, marginBottom: 4 },
  adjustNote: { ...type.caption, color: colors.warning, marginBottom: 4, fontWeight: "700" },
  stepValue: { ...type.h2, color: colors.text },
  stepCaption: { ...type.caption, color: colors.textMuted, marginTop: 4 },
  stepCardPrimary: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  stepLabelPrimary: { ...type.caption, color: colors.primary, fontWeight: "700", marginBottom: 4 },
  stepValuePrimary: { ...type.h1, color: colors.primary },
  stepCaptionPrimary: { ...type.caption, color: colors.textMuted, marginTop: 4 },
  macroRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  macroChip: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: spacing.md,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  macroValue: { ...type.h2, color: colors.text },
  macroLabel: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginTop: spacing.xl, marginBottom: spacing.sm },
  rationaleRow: { flexDirection: "row", marginBottom: spacing.xs, paddingRight: spacing.md },
  rationaleBullet: { color: colors.primary, marginRight: spacing.sm },
  rationaleText: { ...type.caption, color: colors.textMuted, flex: 1 },
  replayBtn: {
    backgroundColor: "transparent", borderRadius: 999, borderWidth: 1.5, borderColor: colors.primary,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.xl,
  },
  replayBtnText: { ...type.body, color: colors.primary, fontWeight: "700" },
});

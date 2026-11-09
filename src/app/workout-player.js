import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { loadPlanData, logWorkoutCompletion, loadUid } from "../data/local/storage.mjs";
import { syncDayToCloud } from "../data/cloud/firestore.mjs";
import { dateKey } from "../domain/foodLog.mjs";
import { hapticSetComplete, hapticExerciseComplete, hapticSessionComplete } from "../services/haptics.js";
import ExerciseDetailSheet from "../ui/components/ExerciseDetailSheet";
import { colors, spacing, type, radius } from "../ui/tokens";

function buildSteps(session) {
  return session.exercises.map((ex) => {
    if (ex.type === "exercise") {
      return { kind: "exercise", name: ex.name, category: ex.category, totalSets: ex.sets, reps: ex.reps, restSec: ex.restSec };
    }
    return { kind: "single", name: ex.name, desc: ex.desc, restSec: ex.type === "finisher" ? 300 : 0 };
  });
}

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [setsDone, setSetsDone] = useState(0);
  const [resting, setResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [complete, setComplete] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadPlanData().then((data) => {
      if (!data) { router.back(); return; }
      const dayIndex = new Date().getDay() % data.plan.sessions.length;
      setSteps(buildSteps(data.plan.sessions[dayIndex]));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!resting) return;
    intervalRef.current = setInterval(() => {
      setRestRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setResting(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [resting]);

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Loading…</Text></View>;

  const totalSets = steps.reduce((sum, s) => sum + (s.kind === "exercise" ? s.totalSets : 1), 0);
  const doneSoFar = steps.slice(0, stepIndex).reduce((sum, s) => sum + (s.kind === "exercise" ? s.totalSets : 1), 0) + setsDone;
  const progress = totalSets > 0 ? doneSoFar / totalSets : 0;

  const step = steps[stepIndex];
  const stepTotal = step?.kind === "exercise" ? step.totalSets : 1;

  const advance = () => {
    if (stepIndex + 1 >= steps.length) {
      hapticSessionComplete();
      logWorkoutCompletion();
      loadUid().then(uid => {
        if (uid) syncDayToCloud(uid, dateKey(new Date()), { foodEntries: [], workoutDone: true });
      });
      setComplete(true);
    } else {
      hapticExerciseComplete();
      setStepIndex((i) => i + 1);
      setSetsDone(0);
    }
  };

  const checkSet = () => {
    hapticSetComplete();
    const next = setsDone + 1;
    setSetsDone(next);
    if (next >= stepTotal) {
      setTimeout(advance, 400);
    }
  };

  const startRest = () => {
    setRestRemaining(step.restSec || 30);
    setResting(true);
  };

  if (complete) {
    return (
      <View style={styles.center}>
        <Text style={styles.completeTitle}>Session complete 🔥</Text>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.dismiss} onPress={() => router.back()}>
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View key={stepIndex} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.stepArea}>
        <View style={styles.nameRow}>
          <Text style={styles.exerciseName}>{step.name}</Text>
          <Pressable onPress={() => setSheetOpen(true)} hitSlop={10} style={styles.infoBtn}>
            <Text style={styles.infoIcon}>ⓘ</Text>
          </Pressable>
        </View>
        {step.kind === "exercise" && <Text style={styles.exerciseMeta}>{step.reps} reps per set</Text>}
        {step.kind === "single" && step.desc && <Text style={styles.exerciseMeta}>{step.desc}</Text>}

        {resting ? (
          <View style={styles.restArea}>
            <Text style={styles.restLabel}>Resting</Text>
            <Text style={styles.restTimer}>{restRemaining}s</Text>
          </View>
        ) : (
          <>
            {step.kind === "exercise" ? (
              <View style={styles.setsRow}>
                {Array.from({ length: stepTotal }).map((_, i) => (
                  <Pressable
                    key={i}
                    disabled={i !== setsDone}
                    style={[styles.setCircle, i < setsDone && styles.setCircleDone, i === setsDone && styles.setCircleActive]}
                    onPress={checkSet}
                  >
                    <Text style={styles.setCircleText}>{i + 1}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Pressable style={styles.markDoneBtn} onPress={checkSet}>
                <Text style={styles.markDoneText}>Mark done</Text>
              </Pressable>
            )}
            {setsDone > 0 && setsDone < stepTotal && (
              <Pressable style={styles.restBtn} onPress={startRest}>
                <Text style={styles.restBtnText}>Start Rest</Text>
              </Pressable>
            )}
          </>
        )}
      </Animated.View>

      <ExerciseDetailSheet visible={sheetOpen} exercise={step} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, paddingTop: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  loadingText: { ...type.body, color: colors.textMuted },
  dismiss: { alignSelf: "flex-end", padding: spacing.sm },
  dismissText: { ...type.h2, color: colors.textMuted },
  progressTrack: { height: 6, backgroundColor: colors.surface, borderRadius: 999, marginTop: spacing.md, marginBottom: spacing.xxl, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.success, borderRadius: 999 },
  stepArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  exerciseName: { ...type.h1, color: colors.text, textAlign: "center" },
  infoBtn: { padding: 4 },
  infoIcon: { ...type.body, color: colors.textMuted, fontSize: 20 },
  exerciseMeta: { ...type.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl },
  setsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  setCircle: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.surface,
  },
  setCircleActive: { borderColor: colors.primary },
  setCircleDone: { backgroundColor: colors.success, borderColor: colors.success },
  setCircleText: { ...type.body, color: colors.text, fontWeight: "700" },
  markDoneBtn: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.lg,
  },
  markDoneText: { ...type.body, color: colors.bg, fontWeight: "700" },
  restBtn: { marginTop: spacing.xl, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 999, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  restBtnText: { ...type.body, color: colors.primary, fontWeight: "700" },
  restArea: { alignItems: "center" },
  restLabel: { ...type.caption, color: colors.textMuted, marginBottom: spacing.sm },
  restTimer: { ...type.h1, color: colors.primary, fontSize: 56 },
  completeTitle: { ...type.h1, color: colors.text, textAlign: "center", marginBottom: spacing.xl },
  closeBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  closeBtnText: { ...type.body, color: colors.bg, fontWeight: "700" },
});


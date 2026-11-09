import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { colors, spacing, type, radius } from "../../ui/tokens";

const CATEGORY_LABELS = {
  squat: "Squat pattern", hinge: "Hip hinge", lunge: "Lunge pattern",
  push_horizontal: "Horizontal push", push_vertical: "Vertical push",
  pull_horizontal: "Horizontal pull", pull_vertical: "Vertical pull",
  core: "Core", carry: "Loaded carry",
};

export default function ExerciseDetailSheet({ visible, exercise, onClose }) {
  if (!visible || !exercise) return null;

  const searchQuery = encodeURIComponent(`${exercise.name} proper form tutorial`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(18).stiffness(180)}
        exiting={SlideOutDown.duration(200)}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>
        {exercise.category && CATEGORY_LABELS[exercise.category] && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{CATEGORY_LABELS[exercise.category]}</Text>
          </View>
        )}
        {exercise.desc && <Text style={styles.desc}>{exercise.desc}</Text>}
        <Pressable style={styles.watchBtn} onPress={() => Linking.openURL(youtubeUrl)}>
          <Text style={styles.watchBtnText}>Watch proper form ↗</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: spacing.lg, paddingBottom: spacing.xl,
    borderTopWidth: 1, borderColor: colors.border,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  name: { ...type.h2, color: colors.text, flex: 1 },
  closeIcon: { ...type.h2, color: colors.textMuted, fontSize: 20 },
  tag: { alignSelf: "flex-start", backgroundColor: colors.bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: spacing.sm, marginBottom: spacing.md },
  tagText: { ...type.caption, color: colors.primary, fontWeight: "700" },
  desc: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg },
  watchBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: spacing.md, alignItems: "center" },
  watchBtnText: { ...type.body, color: colors.bg, fontWeight: "700" },
});

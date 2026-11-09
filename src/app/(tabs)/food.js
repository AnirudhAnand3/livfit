import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, ActivityIndicator, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import foods from "../../data/foods.json" with { type: "json" };
import { createFoodEntry, computeDailyTotals, computeProgress } from "../../domain/foodLog.mjs";
import { loadFoodLog, addFoodEntry, removeFoodEntry, loadPlanData, loadUid } from "../../data/local/storage.mjs";
import { syncDayToCloud } from "../../data/cloud/firestore.mjs";
import { dateKey } from "../../domain/foodLog.mjs";
import ProgressRing from "../../ui/components/ProgressRing";
import { colors, spacing, type, radius } from "../../ui/tokens";

const CATEGORIES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch_dinner", label: "Lunch / Dinner" },
  { id: "snacks", label: "Snacks" },
  { id: "beverages", label: "Beverages" },
  { id: "protein_sources", label: "Protein Sources" },
];
const MULTIPLIERS = [0.5, 1, 1.5, 2];

export default function FoodScreen() {
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState(null);
  const [entries, setEntries] = useState([]);
  const [pickerFood, setPickerFood] = useState(null);
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadPlanData(), loadFoodLog()]).then(([plan, log]) => {
        if (!active) return;
        setTargets(plan?.targets ?? null);
        setEntries(log);
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  const filteredFoods = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [query]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!targets) return <View style={styles.center}><Text style={styles.emptyText}>Complete onboarding first</Text></View>;

  const totals = computeDailyTotals(entries);
  const progress = computeProgress(totals, targets);

  const confirmAdd = async (multiplier) => {
    const entry = createFoodEntry(pickerFood, multiplier);
    const updated = await addFoodEntry(entry);
    setEntries(updated);
    setPickerFood(null);
    loadUid().then(uid => {
      if (uid) syncDayToCloud(uid, dateKey(new Date()), { foodEntries: updated, workoutDone: false });
    });
  };

  const removeEntry = async (index) => {
    const updated = await removeFoodEntry(index);
    setEntries(updated);
    loadUid().then(uid => {
      if (uid) syncDayToCloud(uid, dateKey(new Date()), { foodEntries: updated, workoutDone: false });
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Food</Text>

        <View style={styles.ringsRow}>
          <ProgressRing size={110} strokeWidth={10} progress={progress.kcal} color={colors.primary} value={totals.kcal} label="kcal" />
          <ProgressRing size={80} strokeWidth={7} progress={progress.protein} color={colors.success} value={`${totals.protein}g`} label="protein" />
          <ProgressRing size={80} strokeWidth={7} progress={progress.carbs} color={colors.warning} value={`${totals.carbs}g`} label="carbs" />
          <ProgressRing size={80} strokeWidth={7} progress={progress.fat} color={colors.textMuted} value={`${totals.fat}g`} label="fat" />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search foods…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />

        {entries.length > 0 && (
          <View style={styles.loggedSection}>
            <Text style={styles.sectionTitle}>Logged today</Text>
            {entries.map((e, i) => (
              <View key={i} style={styles.loggedRow}>
                <Text style={styles.loggedName}>{e.name} ({e.multiplier}x)</Text>
                <View style={styles.loggedRight}>
                  <Text style={styles.loggedKcal}>{e.kcal} kcal</Text>
                  <Pressable onPress={() => removeEntry(i)} hitSlop={8}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {filteredFoods ? (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>
              {filteredFoods.length > 0 ? `${filteredFoods.length} result${filteredFoods.length === 1 ? "" : "s"}` : "No matches"}
            </Text>
            {filteredFoods.map((f) => (
              <Pressable key={f.id} style={styles.foodRow} onPress={() => setPickerFood(f)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{f.name}</Text>
                  <Text style={styles.foodMeta}>{f.baseUnit} · {f.kcal} kcal</Text>
                </View>
                <Text style={styles.addIcon}>+</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.categorySection}>
              <Text style={styles.sectionTitle}>{cat.label}</Text>
              {foods.filter((f) => f.category === cat.id).map((f) => (
                <Pressable key={f.id} style={styles.foodRow} onPress={() => setPickerFood(f)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{f.name}</Text>
                    <Text style={styles.foodMeta}>{f.baseUnit} · {f.kcal} kcal</Text>
                  </View>
                  <Text style={styles.addIcon}>+</Text>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!pickerFood} transparent animationType="fade" onRequestClose={() => setPickerFood(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerFood(null)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{pickerFood?.name}</Text>
            <Text style={styles.modalSub}>Base: {pickerFood?.baseUnit}</Text>
            <View style={styles.multiplierRow}>
              {MULTIPLIERS.map((m) => (
                <Pressable key={m} style={styles.multiplierChip} onPress={() => confirmAdd(m)}>
                  <Text style={styles.multiplierText}>{m}x</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  emptyText: { ...type.body, color: colors.textMuted },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },
  ringsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  searchInput: {
    backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, color: colors.text, ...type.body,
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...type.body, color: colors.text, fontWeight: "700", marginBottom: spacing.sm, marginTop: spacing.md },
  loggedSection: { marginBottom: spacing.lg },
  loggedRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  loggedName: { ...type.body, color: colors.text, flex: 1 },
  loggedRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  loggedKcal: { ...type.caption, color: colors.textMuted },
  removeIcon: { ...type.body, color: colors.textMuted },
  categorySection: { marginBottom: spacing.md },
  foodRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  foodName: { ...type.body, color: colors.text },
  foodMeta: { ...type.caption, color: colors.textMuted },
  addIcon: { ...type.h2, color: colors.primary },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { ...type.h2, color: colors.text, marginBottom: spacing.xs },
  modalSub: { ...type.caption, color: colors.textMuted, marginBottom: spacing.lg },
  multiplierRow: { flexDirection: "row", gap: spacing.sm },
  multiplierChip: {
    flex: 1, backgroundColor: colors.bg, borderRadius: radius.sm, paddingVertical: spacing.md,
    alignItems: "center", borderWidth: 1.5, borderColor: colors.border,
  },
  multiplierText: { ...type.body, color: colors.primary, fontWeight: "700" },
});


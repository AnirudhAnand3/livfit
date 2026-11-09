import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { loadUid, loadPlanData, savePlanData, saveFoodLog, clearAllUserData } from "../data/local/storage.mjs";
import { fetchPlanFromCloud, fetchDaysFromCloud } from "../data/cloud/firestore.mjs";
import { dateKey } from "../domain/foodLog.mjs";
import { colors, spacing, type } from "../ui/tokens";

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const uid = await loadUid();
      if (uid) {
        const localPlan = await loadPlanData();
        const localUidMatches = localPlan?.profile != null;
        if (!localUidMatches) {
          await clearAllUserData();
          const cloudPlan = await fetchPlanFromCloud(uid);
          if (cloudPlan) {
            await savePlanData(cloudPlan);
            const cloudDays = await fetchDaysFromCloud(uid);
            for (const [key, val] of Object.entries(cloudDays)) {
              if (val.foodEntries?.length) {
                const parts = key.split("-");
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                await saveFoodLog(val.foodEntries, d);
              }
            }
          }
        }
        const plan = await loadPlanData();
        router.replace(plan ? "/(tabs)/today" : "/onboarding");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LivFit</Text>
      <Text style={styles.subtitle}>Training and nutrition that explain themselves.</Text>
      <Pressable style={styles.button} onPress={() => router.push("/auth")}>
        <Text style={styles.buttonText}>Get started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...type.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
  },
  buttonText: { ...type.body, color: colors.bg, fontWeight: "700" },
});



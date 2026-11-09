import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, type } from "../../ui/tokens";

export default function MedicalGate() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check with your doctor first</Text>
      <Text style={styles.body}>
        Based on what you shared, we'd rather you get medical clearance before starting a new
        training program. This isn't a diagnosis — it's a precaution. LivFit is not a medical
        device and does not provide medical advice.
      </Text>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Go back and review my answers</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, justifyContent: "center" },
  title: { ...type.h2, color: colors.warning, marginBottom: spacing.md, textAlign: "center" },
  body: { ...type.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl, lineHeight: 24 },
  back: { alignItems: "center", padding: spacing.md },
  backText: { ...type.body, color: colors.primary, fontWeight: "600" },
});

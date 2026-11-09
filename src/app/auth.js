import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { saveUid, loadPlanData, clearAllUserData, loadUid } from "../data/local/storage.mjs";
import { colors, spacing, type, radius } from "../ui/tokens";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const friendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email": return "That doesn't look like a valid email.";
      case "auth/user-not-found": return "No account found with that email.";
      case "auth/wrong-password": return "Incorrect password.";
      case "auth/email-already-in-use": return "An account with that email already exists.";
      case "auth/weak-password": return "Password should be at least 6 characters.";
      case "auth/too-many-requests": return "Too many attempts. Try again later.";
      case "auth/invalid-credential": return "Incorrect email or password.";
      default: return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      let cred;
      if (mode === "register") {
        cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      const previousUid = await loadUid();
      await saveUid(cred.user.uid);
      if (previousUid !== cred.user.uid) {
        await clearAllUserData();
        const plan = await loadPlanData();
        router.replace(plan ? "/(tabs)/today" : "/onboarding");
      } else {
        const plan = await loadPlanData();
        router.replace(plan ? "/(tabs)/today" : "/onboarding");
      }
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>LivFit</Text>
        <Text style={styles.subtitle}>{mode === "login" ? "Welcome back." : "Create your account."}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.bg} />
              : <Text style={styles.buttonText}>{mode === "login" ? "Log in" : "Create account"}</Text>
            }
          </Pressable>
        </View>

        <Pressable onPress={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          <Text style={styles.toggle}>
            {mode === "login" ? "No account? Create one" : "Already have an account? Log in"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.xl },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: { ...type.caption, color: colors.textMuted, fontWeight: "700", marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    ...type.body,
    marginBottom: spacing.sm,
  },
  error: { ...type.caption, color: colors.warning, marginBottom: spacing.sm, marginTop: spacing.xs },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...type.body, color: colors.bg, fontWeight: "700" },
  toggle: { ...type.caption, color: colors.primary, fontWeight: "700" },
});


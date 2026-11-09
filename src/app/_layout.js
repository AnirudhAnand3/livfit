import { Stack } from "expo-router";
import { colors } from "../ui/tokens";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
      <Stack.Screen name="workout-player" options={{ presentation: "modal" }} />
    </Stack>
  );
}

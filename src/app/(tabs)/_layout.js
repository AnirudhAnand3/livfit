import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../ui/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: "Today", tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="plan"
        options={{ title: "Plan", tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="food"
        options={{ title: "Food", tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}

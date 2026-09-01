import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{
        animation: "fade",
        headerShown: false,
      }}
    />
  );
}

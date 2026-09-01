import { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { LabelSet } from "../../constants/labels";
import { COLORS } from "../../constants/theme";
import { onboardingSteps } from "../../screens/onboarding/types";
import { OnboardingBackground } from "./OnboardingBackground";
import { StepHeader } from "./StepHeader";

type OnboardingPageProps = {
  children: ReactNode;
  copy: LabelSet;
  currentStep?: number;
  onBack?: () => void;
};

export function OnboardingPage({
  children,
  copy,
  currentStep,
  onBack,
}: OnboardingPageProps) {
  const transition = useRef(new Animated.Value(0)).current;
  const showsHeader = currentStep !== undefined && onBack !== undefined;

  useEffect(() => {
    Animated.spring(transition, {
      damping: 18,
      mass: 0.8,
      stiffness: 150,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [transition]);

  const animatedStyle = {
    opacity: transition,
    transform: [{
      translateY: transition.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 0],
      }),
    }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <OnboardingBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.screen}>
          {showsHeader && (
            <StepHeader
              backLabel={copy.accessibility.back}
              currentStep={currentStep}
              onBack={onBack}
              progressLabel={copy.progress(currentStep, onboardingSteps.length)}
              totalSteps={onboardingSteps.length}
            />
          )}

          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.animatedContent, animatedStyle]}>
              {children}
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  screen: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 560,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  animatedContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
});

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "welcome" | "goals" | "profile" | "target" | "done";

type Goal = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
};

const COLORS = {
  background: "#F2F8FC",
  surface: "#FFFFFF",
  ink: "#122B3F",
  muted: "#6B7F8E",
  blue: "#2D86D5",
  blueDark: "#1261A6",
  blueSoft: "#DCEFFD",
  pink: "#F06F9E",
  pinkSoft: "#FCE8F0",
  border: "#DDE9F0",
  success: "#2BAA82",
};

const goals: Goal[] = [
  { id: "habit", icon: "calendar-outline", label: "Criar o hábito", description: "Beber água todos os dias" },
  { id: "energy", icon: "flash-outline", label: "Ter mais energia", description: "Sentir mais disposição" },
  { id: "training", icon: "barbell-outline", label: "Melhorar nos treinos", description: "Apoiar minha rotina ativa" },
  { id: "focus", icon: "sparkles-outline", label: "Manter o foco", description: "Cuidar da concentração" },
  { id: "wellbeing", icon: "heart-outline", label: "Cuidar de mim", description: "Priorizar meu bem-estar" },
  { id: "soda", icon: "water-outline", label: "Trocar outras bebidas", description: "Escolher mais água no dia" },
];

const mascot = {
  welcome: require("../assets/images/mascote/mascote-02.png"),
  goals: require("../assets/images/mascote/mascote-03.png"),
  target: require("../assets/images/mascote/mascote-10.png"),
  done: require("../assets/images/mascote/mascote-09.png"),
};

const stepOrder: Step[] = ["goals", "profile", "target"];

function roundToFifty(value: number) {
  return Math.round(value / 50) * 50;
}

function formatLiters(value: number) {
  return `${(value / 1000).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} L`;
}

function PrimaryButton({ label, onPress, disabled = false, icon = "arrow-forward" }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <View style={styles.buttonIconBubble}>
        <Ionicons color={COLORS.blueDark} name={icon} size={18} />
      </View>
    </Pressable>
  );
}

function StepHeader({ step, onBack }: { step: Step; onBack: () => void }) {
  const currentStep = stepOrder.indexOf(step) + 1;

  return (
    <View style={styles.stepHeader}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
      >
        <Ionicons color={COLORS.ink} name="arrow-back" size={22} />
      </Pressable>
      <View style={styles.progressArea}>
        <Text style={styles.progressLabel}>PASSO {currentStep} DE 3</Text>
        <View style={styles.progressTrack}>
          {stepOrder.map((item, index) => (
            <View
              key={item}
              style={[styles.progressSegment, index < currentStep && styles.progressSegmentActive]}
            />
          ))}
        </View>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function NumberField({ label, value, onChangeText, unit, placeholder }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
  placeholder: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor="#A7B6C0"
          returnKeyType="next"
          selectionColor={COLORS.blue}
          style={styles.input}
          value={value}
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

export default function Index() {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [manualTarget, setManualTarget] = useState(2450);
  const transition = useRef(new Animated.Value(1)).current;

  const recommendedTarget = roundToFifty((Number(weight) || 70) * 35);
  const profileComplete =
    Number(height) >= 100 && Number(height) <= 250 &&
    Number(age) >= 13 && Number(age) <= 120 &&
    Number(weight) >= 30 && Number(weight) <= 300;

  useEffect(() => {
    transition.setValue(0);
    Animated.spring(transition, {
      damping: 18,
      mass: 0.8,
      stiffness: 150,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [step, transition]);

  const animatedStyle = {
    opacity: transition,
    transform: [{
      translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
    }],
  };

  function changeStep(nextStep: Step) {
    void Haptics.selectionAsync();
    setStep(nextStep);
  }

  function toggleGoal(goalId: string) {
    void Haptics.selectionAsync();
    setSelectedGoals((current) => current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId]);
  }

  function goBack() {
    const previousStep: Record<"goals" | "profile" | "target", Step> = {
      goals: "welcome",
      profile: "goals",
      target: "profile",
    };
    if (step === "goals" || step === "profile" || step === "target") {
      changeStep(previousStep[step]);
    }
  }

  function openTargetStep() {
    setManualTarget(recommendedTarget);
    changeStep("target");
  }

  function adjustTarget(amount: number) {
    void Haptics.selectionAsync();
    setManualTarget((current) => Math.min(6000, Math.max(500, current + amount)));
  }

  function finishOnboarding() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("done");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={styles.blueOrb} />
        <View style={styles.pinkOrb} />
        <View style={styles.smallOrb} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
        <View style={styles.screen}>
          {step !== "welcome" && step !== "done" && <StepHeader onBack={goBack} step={step} />}
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.animatedContent, animatedStyle]}>
              {step === "welcome" && (
                <View style={styles.welcomeScreen}>
                  <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                      <Ionicons color={COLORS.surface} name="water" size={18} />
                    </View>
                    <Text style={styles.brandName}>waterly</Text>
                  </View>

                  <View style={styles.mascotStage}>
                    <View style={styles.sparkleOne}><Ionicons color="#F3AA32" name="sparkles" size={22} /></View>
                    <View style={styles.sparkleTwo}><Ionicons color={COLORS.blue} name="sparkles" size={16} /></View>
                    <View style={styles.mascotCircle}>
                      <Image source={mascot.welcome} style={styles.welcomeMascot} />
                    </View>
                    <View style={styles.floatingDrop}>
                      <Ionicons color={COLORS.surface} name="water" size={18} />
                    </View>
                  </View>

                  <View style={styles.welcomeCopy}>
                    <View style={styles.eyebrowPill}>
                      <Text style={styles.eyebrowText}>SEU NOVO PARCEIRO DE HÁBITO</Text>
                    </View>
                    <Text style={styles.welcomeTitle}>
                      Hidratar fica melhor{"\n"}quando vira <Text style={styles.titleAccent}>jogo.</Text>
                    </Text>
                    <Text style={styles.welcomeDescription}>
                      Crie sua meta, cuide da sua sequência e evolua junto com seus amigos.
                    </Text>
                  </View>
                  <PrimaryButton label="Montar minha meta" onPress={() => changeStep("goals")} />
                  <Text style={styles.welcomeFootnote}>Leva menos de 1 minuto</Text>
                </View>
              )}

              {step === "goals" && (
                <View style={styles.contentScreen}>
                  <View style={styles.compactMascotRow}>
                    <Image source={mascot.goals} style={styles.compactMascot} />
                    <View style={styles.speechBubble}>
                      <Text style={styles.speechText}>Pode escolher quantos quiser!</Text>
                    </View>
                  </View>
                  <Text style={styles.screenTitle}>O que te trouxe até aqui?</Text>
                  <Text style={styles.screenDescription}>
                    Vamos personalizar sua experiência com base no que importa para você.
                  </Text>
                  <View style={styles.goalList}>
                    {goals.map((goal) => {
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected }}
                          key={goal.id}
                          onPress={() => toggleGoal(goal.id)}
                          style={({ pressed }) => [
                            styles.goalCard,
                            isSelected && styles.goalCardSelected,
                            pressed && styles.cardPressed,
                          ]}
                        >
                          <View style={[styles.goalIcon, isSelected && styles.goalIconSelected]}>
                            <Ionicons color={isSelected ? COLORS.blueDark : COLORS.muted} name={goal.icon} size={22} />
                          </View>
                          <View style={styles.goalCopy}>
                            <Text style={styles.goalLabel}>{goal.label}</Text>
                            <Text style={styles.goalDescription}>{goal.description}</Text>
                          </View>
                          <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                            {isSelected && <Ionicons color={COLORS.surface} name="checkmark" size={16} />}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  <PrimaryButton
                    disabled={selectedGoals.length === 0}
                    label={selectedGoals.length > 1 ? `Continuar com ${selectedGoals.length} objetivos` : "Continuar"}
                    onPress={() => changeStep("profile")}
                  />
                </View>
              )}

              {step === "profile" && (
                <View style={styles.contentScreen}>
                  <View style={styles.sectionIcon}>
                    <Ionicons color={COLORS.blueDark} name="body-outline" size={26} />
                  </View>
                  <Text style={styles.screenTitle}>Agora, sobre você</Text>
                  <Text style={styles.screenDescription}>
                    Esses dados ajudam a criar um ponto de partida para sua meta diária.
                  </Text>
                  <View style={styles.formCard}>
                    <NumberField label="Altura" onChangeText={setHeight} placeholder="170" unit="cm" value={height} />
                    <View style={styles.fieldDivider} />
                    <NumberField label="Idade" onChangeText={setAge} placeholder="25" unit="anos" value={age} />
                    <View style={styles.fieldDivider} />
                    <NumberField label="Peso" onChangeText={setWeight} placeholder="70" unit="kg" value={weight} />
                  </View>
                  <View style={styles.privacyNote}>
                    <Ionicons color={COLORS.blueDark} name="lock-closed" size={16} />
                    <Text style={styles.privacyText}>
                      Seus dados físicos são privados e não aparecem no perfil social.
                    </Text>
                  </View>
                  <PrimaryButton disabled={!profileComplete} icon="sparkles" label="Calcular minha meta" onPress={openTargetStep} />
                </View>
              )}

              {step === "target" && (
                <View style={styles.contentScreen}>
                  <Text style={styles.targetEyebrow}>SUA RECOMENDAÇÃO DIÁRIA</Text>
                  <Text style={styles.screenTitle}>Um bom começo para você</Text>
                  <Text style={styles.screenDescription}>
                    Calculamos uma estimativa pelo seu peso. Você continua no controle da sua meta.
                  </Text>
                  <View style={styles.targetCard}>
                    <View style={styles.targetGlow} />
                    <Image source={mascot.target} style={styles.targetMascot} />
                    <View style={styles.targetValueArea}>
                      <Text style={styles.targetValue}>{formatLiters(manualTarget)}</Text>
                      <Text style={styles.targetUnit}>por dia</Text>
                    </View>
                    <View style={styles.targetControls}>
                      <Pressable
                        accessibilityLabel="Diminuir meta em 100 mililitros"
                        accessibilityRole="button"
                        onPress={() => adjustTarget(-100)}
                        style={({ pressed }) => [styles.targetControlButton, pressed && styles.buttonPressed]}
                      >
                        <Ionicons color={COLORS.blueDark} name="remove" size={24} />
                      </Pressable>
                      <View style={styles.targetCenterLabel}>
                        <Ionicons color={COLORS.blue} name="water" size={16} />
                        <Text style={styles.targetMl}>{manualTarget.toLocaleString("pt-BR")} ml</Text>
                      </View>
                      <Pressable
                        accessibilityLabel="Aumentar meta em 100 mililitros"
                        accessibilityRole="button"
                        onPress={() => adjustTarget(100)}
                        style={({ pressed }) => [styles.targetControlButton, pressed && styles.buttonPressed]}
                      >
                        <Ionicons color={COLORS.blueDark} name="add" size={24} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.recommendationNote}>
                    <View style={styles.recommendationIcon}>
                      <Ionicons color={COLORS.pink} name="bulb-outline" size={18} />
                    </View>
                    <Text style={styles.recommendationText}>
                      A recomendação inicial é {formatLiters(recommendedTarget)}. Ajuste em passos de 100 ml para combinar com sua rotina.
                    </Text>
                  </View>
                  <PrimaryButton icon="checkmark" label="Definir minha meta" onPress={finishOnboarding} />
                </View>
              )}

              {step === "done" && (
                <View style={styles.doneScreen}>
                  <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                      <Ionicons color={COLORS.surface} name="water" size={18} />
                    </View>
                    <Text style={styles.brandName}>waterly</Text>
                  </View>
                  <View style={styles.doneMascotCircle}>
                    <Image source={mascot.done} style={styles.doneMascot} />
                  </View>
                  <View style={styles.successPill}>
                    <Ionicons color={COLORS.success} name="checkmark-circle" size={18} />
                    <Text style={styles.successPillText}>META CRIADA</Text>
                  </View>
                  <Text style={styles.doneTitle}>Tudo pronto para{"\n"}começar!</Text>
                  <Text style={styles.doneDescription}>
                    Sua primeira missão é simples: completar {formatLiters(manualTarget)} hoje.
                  </Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                      <Ionicons color={COLORS.blue} name="water" size={22} />
                      <View>
                        <Text style={styles.summaryLabel}>META DIÁRIA</Text>
                        <Text style={styles.summaryValue}>{formatLiters(manualTarget)}</Text>
                      </View>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Ionicons color={COLORS.pink} name="flag" size={22} />
                      <View>
                        <Text style={styles.summaryLabel}>OBJETIVOS</Text>
                        <Text style={styles.summaryValue}>{selectedGoals.length} escolhidos</Text>
                      </View>
                    </View>
                  </View>
                  <PrimaryButton
                    icon="rocket-outline"
                    label="Começar a hidratar"
                    onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  />
                  <Pressable accessibilityRole="button" onPress={() => changeStep("target")} style={({ pressed }) => pressed && styles.buttonPressed}>
                    <Text style={styles.reviewLink}>Revisar minha meta</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  keyboardView: { flex: 1 },
  screen: { alignSelf: "center", flex: 1, maxWidth: 560, width: "100%" },
  backgroundDecor: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  blueOrb: { backgroundColor: "rgba(120, 200, 244, 0.18)", borderRadius: 160, height: 280, position: "absolute", right: -130, top: -70, width: 280 },
  pinkOrb: { backgroundColor: "rgba(240, 111, 158, 0.08)", borderRadius: 130, bottom: 60, height: 230, left: -150, position: "absolute", width: 230 },
  smallOrb: { backgroundColor: "rgba(45, 134, 213, 0.08)", borderRadius: 50, height: 72, left: 34, position: "absolute", top: 174, width: 72 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  animatedContent: { flexGrow: 1, paddingHorizontal: 24 },
  stepHeader: { alignItems: "center", flexDirection: "row", gap: 16, paddingHorizontal: 24, paddingVertical: 14 },
  backButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.78)", borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  progressArea: { alignItems: "center", flex: 1, gap: 7 },
  progressLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  progressTrack: { flexDirection: "row", gap: 6, maxWidth: 210, width: "100%" },
  progressSegment: { backgroundColor: "#D9E6ED", borderRadius: 4, flex: 1, height: 5 },
  progressSegmentActive: { backgroundColor: COLORS.blue },
  headerSpacer: { width: 44 },
  welcomeScreen: { flex: 1, justifyContent: "space-between", minHeight: 690, paddingBottom: 12, paddingTop: 12 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 9 },
  brandMark: { alignItems: "center", backgroundColor: COLORS.blue, borderRadius: 13, height: 34, justifyContent: "center", transform: [{ rotate: "-8deg" }], width: 34 },
  brandName: { color: COLORS.ink, fontSize: 21, fontWeight: "900", letterSpacing: -0.7 },
  mascotStage: { alignItems: "center", alignSelf: "center", height: 270, justifyContent: "center", marginVertical: 8, position: "relative", width: 300 },
  mascotCircle: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: "rgba(45, 134, 213, 0.16)", borderRadius: 115, borderWidth: 1, height: 230, justifyContent: "center", overflow: "hidden", shadowColor: "#3979A8", shadowOffset: { height: 16, width: 0 }, shadowOpacity: 0.14, shadowRadius: 28, width: 230 },
  welcomeMascot: { height: 210, resizeMode: "contain", width: 210 },
  sparkleOne: { left: 18, position: "absolute", top: 26 },
  sparkleTwo: { position: "absolute", right: 14, top: 68 },
  floatingDrop: { alignItems: "center", backgroundColor: COLORS.blue, borderColor: COLORS.background, borderRadius: 23, borderWidth: 4, bottom: 24, height: 46, justifyContent: "center", position: "absolute", right: 29, transform: [{ rotate: "8deg" }], width: 46 },
  welcomeCopy: { alignItems: "center", gap: 14 },
  eyebrowPill: { backgroundColor: COLORS.blueSoft, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7 },
  eyebrowText: { color: COLORS.blueDark, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  welcomeTitle: { color: COLORS.ink, fontSize: 34, fontWeight: "900", letterSpacing: -1.5, lineHeight: 39, textAlign: "center" },
  titleAccent: { color: COLORS.pink },
  welcomeDescription: { color: COLORS.muted, fontSize: 16, lineHeight: 23, maxWidth: 350, textAlign: "center" },
  welcomeFootnote: { color: COLORS.muted, fontSize: 12, fontWeight: "600", marginTop: -10, textAlign: "center" },
  contentScreen: { flex: 1, paddingTop: 10 },
  compactMascotRow: { alignItems: "center", flexDirection: "row", height: 88, marginBottom: 16 },
  compactMascot: { height: 88, resizeMode: "contain", width: 88 },
  speechBubble: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, marginLeft: 8, paddingHorizontal: 15, paddingVertical: 12 },
  speechText: { color: COLORS.ink, fontSize: 13, fontWeight: "700" },
  screenTitle: { color: COLORS.ink, fontSize: 30, fontWeight: "900", letterSpacing: -1.1, lineHeight: 35 },
  screenDescription: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  goalList: { gap: 10, marginBottom: 24, marginTop: 24 },
  goalCard: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.86)", borderColor: COLORS.border, borderRadius: 20, borderWidth: 1, flexDirection: "row", minHeight: 76, padding: 13 },
  goalCardSelected: { backgroundColor: "#F4FAFF", borderColor: COLORS.blue, borderWidth: 1.5 },
  goalIcon: { alignItems: "center", backgroundColor: "#EEF3F6", borderRadius: 15, height: 48, justifyContent: "center", width: 48 },
  goalIconSelected: { backgroundColor: COLORS.blueSoft },
  goalCopy: { flex: 1, marginLeft: 14 },
  goalLabel: { color: COLORS.ink, fontSize: 15, fontWeight: "800" },
  goalDescription: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  checkCircle: { alignItems: "center", borderColor: "#BAC9D2", borderRadius: 12, borderWidth: 1.5, height: 24, justifyContent: "center", width: 24 },
  checkCircleSelected: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  sectionIcon: { alignItems: "center", backgroundColor: COLORS.blueSoft, borderRadius: 21, height: 54, justifyContent: "center", marginBottom: 20, marginTop: 12, width: 54 },
  formCard: { backgroundColor: "rgba(255,255,255,0.9)", borderColor: COLORS.border, borderRadius: 24, borderWidth: 1, marginTop: 30, paddingHorizontal: 18, shadowColor: "#547A93", shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.08, shadowRadius: 18 },
  fieldGroup: { paddingVertical: 18 },
  fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  inputShell: { alignItems: "center", backgroundColor: COLORS.background, borderColor: "#D7E4EB", borderRadius: 16, borderWidth: 1, flexDirection: "row", height: 58, paddingHorizontal: 16 },
  input: { color: COLORS.ink, flex: 1, fontSize: 22, fontWeight: "800", height: "100%" },
  inputUnit: { color: COLORS.muted, fontSize: 14, fontWeight: "700" },
  fieldDivider: { backgroundColor: COLORS.border, height: StyleSheet.hairlineWidth },
  privacyNote: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginBottom: 32, marginTop: 18, paddingHorizontal: 6 },
  privacyText: { color: COLORS.muted, flex: 1, fontSize: 12, lineHeight: 18 },
  targetEyebrow: { color: COLORS.blueDark, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 10, marginTop: 8 },
  targetCard: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 30, borderWidth: 1, marginTop: 28, overflow: "hidden", paddingBottom: 22, paddingHorizontal: 20, paddingTop: 22, position: "relative", shadowColor: "#3979A8", shadowOffset: { height: 12, width: 0 }, shadowOpacity: 0.12, shadowRadius: 24 },
  targetGlow: { backgroundColor: COLORS.blueSoft, borderRadius: 100, height: 170, position: "absolute", right: -50, top: -70, width: 170 },
  targetMascot: { height: 112, resizeMode: "contain", width: 130 },
  targetValueArea: { alignItems: "center", marginBottom: 20, marginTop: 4 },
  targetValue: { color: COLORS.ink, fontSize: 48, fontWeight: "900", letterSpacing: -2 },
  targetUnit: { color: COLORS.muted, fontSize: 14, fontWeight: "600", marginTop: 2 },
  targetControls: { alignItems: "center", backgroundColor: COLORS.background, borderRadius: 20, flexDirection: "row", justifyContent: "space-between", padding: 7, width: "100%" },
  targetControlButton: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, height: 48, justifyContent: "center", width: 48 },
  targetCenterLabel: { alignItems: "center", flexDirection: "row", gap: 6 },
  targetMl: { color: COLORS.ink, fontSize: 15, fontWeight: "800" },
  recommendationNote: { alignItems: "flex-start", backgroundColor: COLORS.pinkSoft, borderRadius: 18, flexDirection: "row", gap: 11, marginBottom: 28, marginTop: 18, padding: 14 },
  recommendationIcon: { alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 13, height: 32, justifyContent: "center", width: 32 },
  recommendationText: { color: "#6E4555", flex: 1, fontSize: 12, lineHeight: 18 },
  primaryButton: { alignItems: "center", backgroundColor: COLORS.blueDark, borderRadius: 20, flexDirection: "row", justifyContent: "space-between", minHeight: 60, paddingLeft: 22, paddingRight: 8, shadowColor: COLORS.blueDark, shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.2, shadowRadius: 14 },
  primaryButtonDisabled: { backgroundColor: "#AFC1CC", shadowOpacity: 0 },
  primaryButtonText: { color: COLORS.surface, fontSize: 15, fontWeight: "800" },
  buttonIconBubble: { alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  buttonPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  cardPressed: { opacity: 0.82 },
  doneScreen: { flex: 1, justifyContent: "space-between", minHeight: 690, paddingBottom: 12, paddingTop: 12 },
  doneMascotCircle: { alignItems: "center", alignSelf: "center", backgroundColor: COLORS.surface, borderColor: COLORS.pinkSoft, borderRadius: 92, borderWidth: 8, height: 184, justifyContent: "center", marginBottom: 2, marginTop: 18, overflow: "hidden", width: 184 },
  doneMascot: { height: 170, resizeMode: "contain", width: 170 },
  successPill: { alignItems: "center", alignSelf: "center", backgroundColor: "#E5F7F1", borderRadius: 20, flexDirection: "row", gap: 7, paddingHorizontal: 13, paddingVertical: 7 },
  successPillText: { color: COLORS.success, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  doneTitle: { color: COLORS.ink, fontSize: 34, fontWeight: "900", letterSpacing: -1.4, lineHeight: 39, textAlign: "center" },
  doneDescription: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginHorizontal: 18, textAlign: "center" },
  summaryCard: { backgroundColor: "rgba(255,255,255,0.9)", borderColor: COLORS.border, borderRadius: 22, borderWidth: 1, flexDirection: "row", paddingHorizontal: 12, paddingVertical: 18 },
  summaryItem: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, justifyContent: "center" },
  summaryDivider: { backgroundColor: COLORS.border, marginHorizontal: 8, width: 1 },
  summaryLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  summaryValue: { color: COLORS.ink, fontSize: 14, fontWeight: "800", marginTop: 3 },
  reviewLink: { color: COLORS.blueDark, fontSize: 13, fontWeight: "800", paddingVertical: 8, textAlign: "center" },
});

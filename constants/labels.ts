export type GoalId = "habit" | "energy" | "training" | "focus" | "wellbeing" | "soda";
export type AppLanguage = "pt-BR" | "en";

type GoalLabel = {
  id: GoalId;
  label: string;
  description: string;
};

export type LabelSet = {
  appName: string;
  accessibility: {
    back: string;
  };
  progress: (current: number, total: number) => string;
  welcome: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    start: string;
    footnote: string;
  };
  goals: {
    helper: string;
    title: string;
    description: string;
    options: GoalLabel[];
  };
  profile: {
    title: string;
    description: string;
    height: string;
    age: string;
    weight: string;
    heightUnit: string;
    ageUnit: string;
    weightUnit: string;
    heightPlaceholder: string;
    agePlaceholder: string;
    weightPlaceholder: string;
    privacy: string;
  };
  target: {
    eyebrow: string;
    title: string;
    description: string;
    perDay: string;
    liters: string;
    milliliters: string;
    editHint: string;
    decrease: string;
    increase: string;
    recommendation: (value: string) => string;
  };
  done: {
    badge: string;
    title: string;
    mission: (value: string) => string;
    dailyTarget: string;
    goals: string;
    chosenGoals: (count: number) => string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    dailyTarget: string;
  };
  actions: {
    continue: string;
    calculate: string;
    defineTarget: string;
    startHydrating: string;
    reviewTarget: string;
  };
};

export const labels: Record<AppLanguage, LabelSet> = {
  "pt-BR": {
    appName: "waterly",
    accessibility: {
      back: "Voltar",
    },
    progress: (current, total) => `PASSO ${current} DE ${total}`,
    welcome: {
      eyebrow: "SEU NOVO PARCEIRO DE HÁBITO",
      title: "Hidratar fica melhor quando vira ",
      titleAccent: "jogo.",
      description: "Crie sua meta, cuide da sua sequência e evolua junto com seus amigos.",
      start: "Montar minha meta",
      footnote: "Leva menos de 1 minuto",
    },
    goals: {
      helper: "Pode escolher quantos quiser!",
      title: "O que te trouxe até aqui?",
      description: "Vamos personalizar sua experiência com base no que importa para você.",
      options: [
        { id: "habit", label: "Criar o hábito", description: "Beber água todos os dias" },
        { id: "energy", label: "Ter mais energia", description: "Sentir mais disposição" },
        { id: "training", label: "Melhorar nos treinos", description: "Apoiar minha rotina ativa" },
        { id: "focus", label: "Manter o foco", description: "Cuidar da concentração" },
        { id: "wellbeing", label: "Cuidar de mim", description: "Priorizar meu bem-estar" },
        { id: "soda", label: "Trocar outras bebidas", description: "Escolher mais água no dia" },
      ],
    },
    profile: {
      title: "Agora, sobre você",
      description: "Esses dados ajudam a criar um ponto de partida para sua meta diária.",
      height: "Altura",
      age: "Idade",
      weight: "Peso",
      heightUnit: "cm",
      ageUnit: "anos",
      weightUnit: "kg",
      heightPlaceholder: "170",
      agePlaceholder: "25",
      weightPlaceholder: "70",
      privacy: "Seus dados físicos são privados e não aparecem no perfil social.",
    },
    target: {
      eyebrow: "SUA RECOMENDAÇÃO DIÁRIA",
      title: "Um bom começo para você",
      description: "Calculamos uma estimativa pelo seu peso. Você continua no controle da sua meta.",
      perDay: "por dia",
      liters: "L",
      milliliters: "ml",
      editHint: "Toque no valor para digitar",
      decrease: "Diminuir meta em 100 mililitros",
      increase: "Aumentar meta em 100 mililitros",
      recommendation: (value) => `A recomendação inicial é ${value}. Ajuste em passos de 100 ml ou digite sua meta para combinar com sua rotina.`,
    },
    done: {
      badge: "META CRIADA",
      title: "Tudo pronto para começar!",
      mission: (value) => `Sua primeira missão é simples: completar ${value} hoje.`,
      dailyTarget: "META DIÁRIA",
      goals: "OBJETIVOS",
      chosenGoals: (count) => `${count} ${count === 1 ? "escolhido" : "escolhidos"}`,
    },
    home: {
      eyebrow: "META CONFIGURADA",
      title: "Vamos começar a hidratar?",
      description: "Seu espaço diário está pronto. Em breve, você poderá registrar seu primeiro copo por aqui.",
      dailyTarget: "SUA META DIÁRIA",
    },
    actions: {
      continue: "Continuar",
      calculate: "Calcular minha meta",
      defineTarget: "Definir minha meta",
      startHydrating: "Começar a hidratar",
      reviewTarget: "Revisar minha meta",
    },
  },
  en: {
    appName: "waterly",
    accessibility: {
      back: "Go back",
    },
    progress: (current, total) => `STEP ${current} OF ${total}`,
    welcome: {
      eyebrow: "YOUR NEW HABIT PARTNER",
      title: "Hydration is better when it becomes a ",
      titleAccent: "game.",
      description: "Set your goal, protect your streak, and level up with your friends.",
      start: "Build my goal",
      footnote: "Takes less than 1 minute",
    },
    goals: {
      helper: "Choose as many as you like!",
      title: "What brought you here?",
      description: "We’ll personalize your experience around what matters to you.",
      options: [
        { id: "habit", label: "Build the habit", description: "Drink water every day" },
        { id: "energy", label: "Have more energy", description: "Feel more energized" },
        { id: "training", label: "Improve my workouts", description: "Support my active routine" },
        { id: "focus", label: "Stay focused", description: "Take care of my concentration" },
        { id: "wellbeing", label: "Take care of myself", description: "Prioritize my well-being" },
        { id: "soda", label: "Replace other drinks", description: "Choose water more often" },
      ],
    },
    profile: {
      title: "Now, about you",
      description: "These details help us create a starting point for your daily goal.",
      height: "Height",
      age: "Age",
      weight: "Weight",
      heightUnit: "cm",
      ageUnit: "years",
      weightUnit: "kg",
      heightPlaceholder: "170",
      agePlaceholder: "25",
      weightPlaceholder: "70",
      privacy: "Your body data is private and won’t appear on your social profile.",
    },
    target: {
      eyebrow: "YOUR DAILY RECOMMENDATION",
      title: "A good starting point for you",
      description: "We calculated an estimate based on your weight. You stay in control of your goal.",
      perDay: "per day",
      liters: "L",
      milliliters: "ml",
      editHint: "Tap the value to type",
      decrease: "Decrease goal by 100 milliliters",
      increase: "Increase goal by 100 milliliters",
      recommendation: (value) => `Your starting recommendation is ${value}. Adjust it in 100 ml steps or type your goal to fit your routine.`,
    },
    done: {
      badge: "GOAL CREATED",
      title: "You’re ready to get started!",
      mission: (value) => `Your first mission is simple: reach ${value} today.`,
      dailyTarget: "DAILY GOAL",
      goals: "GOALS",
      chosenGoals: (count) => `${count} selected`,
    },
    home: {
      eyebrow: "GOAL SET",
      title: "Ready to start hydrating?",
      description: "Your daily space is ready. Soon, you’ll be able to log your first glass here.",
      dailyTarget: "YOUR DAILY GOAL",
    },
    actions: {
      continue: "Continue",
      calculate: "Calculate my goal",
      defineTarget: "Set my goal",
      startHydrating: "Start hydrating",
      reviewTarget: "Review my goal",
    },
  },
};

export function resolveAppLanguage(languageCode?: string | null): AppLanguage {
  return languageCode?.toLowerCase() === "pt" ? "pt-BR" : "en";
}

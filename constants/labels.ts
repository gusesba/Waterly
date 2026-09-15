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
  auth: {
    eyebrow: string;
    registerTitle: string;
    registerDescription: string;
    loginTitle: string;
    loginDescription: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    passwordHint: string;
    createAccount: string;
    continueWithoutAccount: string;
    login: string;
    logout: string;
    haveAccount: string;
    needAccount: string;
    errors: {
      invalidEmail: string;
      shortPassword: string;
      registerFailed: string;
      accountInUse: string;
      loginFailed: string;
      serverUnavailable: string;
    };
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    dailyTarget: string;
    consumed: string;
    quickAdd: string;
    quickAddFor: (beverage: string) => string;
    customAmount: string;
    customPlaceholder: string;
    addCustom: string;
    todayEntries: string;
    noEntries: string;
    edit: string;
    save: string;
    cancel: string;
    remove: string;
    history: string;
    historyTitle: string;
    historyDescription: string;
    noHistory: string;
    changeError: string;
    offline: string;
    failedSync: (count: number) => string;
    discardFailed: string;
    entrySyncFailed: string;
    entrySyncPending: string;
    pendingSync: (count: number) => string;
    syncing: string;
    retrySync: string;
    beverage: string;
    beverageNames: Record<string, string>;
    waterPercentage: (value: number) => string;
    waterEquivalent: (value: string) => string;
    waterEquivalentShort: (value: string) => string;
    addAmount: (value: string) => string;
    accountRequiredTitle: string;
    accountRequiredDescription: string;
    loading: string;
    loadError: string;
    goalCelebration: string;
    mascotState: Record<"complete" | "empty" | "progress", string>;
    addError: string;
    retry: string;
    signedInAs: (email: string) => string;
  };
  reminders: {
    channelName: string;
    daily: string;
    description: string;
    disabled: string;
    enabled: string;
    invalidTime: string;
    localNote: string;
    notificationBody: string;
    notificationTitle: string;
    open: string;
    openSettings: string;
    permissionDenied: string;
    save: string;
    saveError: string;
    saving: string;
    timeLabel: (position: number) => string;
    times: string;
    title: string;
    unsupported: string;
  };
  achievements: {
    description: string;
    empty: string;
    items: Record<string, { description: string; title: string }>;
    locked: string;
    open: string;
    progress: (current: number, requirement: number) => string;
    title: string;
    unlocked: string;
    unlockedOn: (date: string) => string;
  };
  progression: {
    achievementReward: (achievement: string) => string;
    description: string;
    drops: string;
    empty: string;
    explanation: string;
    history: string;
    open: string;
    prestige: string;
    title: string;
  };
  character: {
    title: string;
    description: string;
    open: string;
    preview: string;
    axolotl: string;
    auras: string;
    auraNames: Record<"natural" | "ocean" | "sunset" | "stellar", string>;
    equipped: string;
    available: string;
    unlockWith: (achievement: string) => string;
    noCost: string;
    loadError: string;
    saveError: string;
  };
  friends: {
    title: string; description: string; open: string; search: string; searchPlaceholder: string;
    searchHint: string; friends: string; incoming: string; outgoing: string; emptyFriends: string;
    emptyRequests: string; add: string; accept: string; decline: string; cancel: string; remove: string;
    pending: string; friend: string; confirmRemove: string; loadError: string; actionError: string;
  };
  groups: {
    tabToday:string; tabGroups:string; tabProfile:string; title:string; description:string; create:string; name:string; namePlaceholder:string;
    groupDescription:string; descriptionPlaceholder:string; save:string; saving:string; empty:string; owner:string; member:string;
    members:(count:number)=>string; addFriends:string; noFriends:string; remove:string; leave:string; delete:string; edit:string;
    confirm:string; cancel:string; loadError:string; actionError:string; ownerCannotLeave:string;
    capacity:(used:number,limit:number)=>string; capacityReached:string; invite:string; inviteDescription:string; generateInvite:string;
    generatingInvite:string; shareInvite:string; revokeInvite:string; invitation:string; invitedBy:(name:string)=>string;
    join:string; joining:string; signInToJoin:string; openGroup:string; notNow:string; inviteUnavailable:string;
    inviteUnavailableDescription:string; backToGroups:string; inviteExpires:(date:string)=>string;
  };
  publicProfile: { bio: string; conflict: string; description: string; displayName: string; open: string; privacy: string; save: string; saveError: string; saving: string; title: string; username: string };
  habits: {
    continueToday: string;
    currentStreak: (days: number) => string;
    longestStreak: (days: number) => string;
    startToday: string;
    todayCompleted: string;
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
    auth: {
      eyebrow: "SUA CONTA",
      registerTitle: "Salve seu progresso",
      registerDescription: "Crie sua conta para manter sua meta segura e acessar seus dados em outros dispositivos.",
      loginTitle: "Que bom ter você de volta",
      loginDescription: "Entre para recuperar sua meta e continuar de onde parou.",
      email: "E-mail",
      emailPlaceholder: "voce@exemplo.com",
      password: "Senha",
      passwordPlaceholder: "Digite sua senha",
      passwordHint: "Use pelo menos 8 caracteres.",
      createAccount: "Criar minha conta",
      continueWithoutAccount: "Continuar sem login",
      login: "Entrar",
      logout: "Sair da conta",
      haveAccount: "Já tem uma conta?",
      needAccount: "Ainda não tem uma conta?",
      errors: {
        invalidEmail: "Digite um e-mail válido.",
        shortPassword: "A senha precisa ter pelo menos 8 caracteres.",
        registerFailed: "Não foi possível criar sua conta. Confira os dados informados.",
        accountInUse: "Este e-mail já está em uso. Entre ou utilize outro e-mail.",
        loginFailed: "E-mail ou senha incorretos.",
        serverUnavailable: "Não foi possível falar com o servidor. Tente novamente em instantes.",
      },
    },
    home: {
      eyebrow: "HOJE",
      title: "Sua hidratação",
      description: "Cada copo conta para completar sua meta do dia.",
      dailyTarget: "SUA META DIÁRIA",
      consumed: "CONSUMIDO",
      quickAdd: "REGISTRO RÁPIDO",
      quickAddFor: (beverage) => `REGISTRO RÁPIDO · ${beverage.toUpperCase()}`,
      customAmount: "OUTRA QUANTIDADE",
      customPlaceholder: "Quantidade em ml",
      addCustom: "Adicionar",
      todayEntries: "REGISTROS DE HOJE",
      noEntries: "Nenhum copo registrado ainda.",
      edit: "Editar",
      save: "Salvar",
      cancel: "Cancelar",
      remove: "Excluir",
      history: "Ver histórico",
      historyTitle: "Seu histórico",
      historyDescription: "Os últimos dias da sua jornada de hidratação.",
      noHistory: "Ainda não há histórico disponível.",
      changeError: "Não foi possível alterar este registro.",
      offline: "Sem conexão",
      failedSync: (count) => `${count} ${count === 1 ? "registro não sincronizou" : "registros não sincronizaram"}`,
      discardFailed: "Descartar pendências com erro",
      entrySyncFailed: "Não sincronizado",
      entrySyncPending: "Aguardando sincronização",
      pendingSync: (count) => `${count} ${count === 1 ? "registro aguardando" : "registros aguardando"} sincronização`,
      syncing: "Sincronizando...",
      retrySync: "Tentar sincronizar",
      beverage: "BEBIDA",
      beverageNames: {
        water: "Água",
        "sparkling-water": "Água com gás",
        coffee: "Café",
        tea: "Chá",
      },
      waterPercentage: (value) => `${value}% de água`,
      waterEquivalent: (value) => `Equivale a ${value} de água`,
      waterEquivalentShort: (value) => `≈ ${value} de água`,
      addAmount: (value) => `Adicionar ${value}`,
      accountRequiredTitle: "Salve seu primeiro copo",
      accountRequiredDescription: "Crie uma conta para registrar e manter sua hidratação sincronizada.",
      loading: "Carregando sua hidratação...",
      loadError: "Não foi possível carregar sua hidratação.",
      goalCelebration: "Meta concluída! Seu cuidado de hoje valeu cada copo.",
      mascotState: {
        complete: "Mascote comemorando a meta concluída",
        empty: "Mascote descansando enquanto espera o primeiro registro",
        progress: "Mascote acompanhando seu progresso",
      },
      addError: "Não foi possível registrar este copo. Tente novamente.",
      retry: "Tentar novamente",
      signedInAs: (email) => `Conta: ${email}`,
    },
    reminders: {
      channelName: "Lembretes de hidratação",
      daily: "Lembretes diários",
      description: "Escolha até três horários para receber um lembrete neste dispositivo.",
      disabled: "Desativados",
      enabled: "Ativados",
      invalidTime: "Use horários válidos no formato HH:mm.",
      localNote: "Os lembretes ficam salvos somente neste dispositivo e podem sofrer pequenos ajustes de horário pelo sistema.",
      notificationBody: "Que tal registrar uma bebida e acompanhar sua meta de hoje?",
      notificationTitle: "Hora de se hidratar",
      open: "Lembretes",
      openSettings: "Abrir configurações do dispositivo",
      permissionDenied: "As notificações estão bloqueadas. Libere a permissão nas configurações do dispositivo.",
      save: "Salvar horários",
      saveError: "Não foi possível atualizar os lembretes.",
      saving: "Salvando...",
      timeLabel: (position) => `Horário do lembrete ${position}`,
      times: "HORÁRIOS",
      title: "Lembretes",
      unsupported: "Lembretes locais não estão disponíveis na versão web.",
    },
    achievements: {
      description: "Complete metas e mantenha sua sequência para desbloquear novos marcos.",
      empty: "Nenhuma conquista disponível no momento.",
      items: {
        "first-goal": { description: "Conclua sua primeira meta diária.", title: "Primeira gota" },
        "streak-3": { description: "Complete sua meta por 3 dias seguidos.", title: "Ritmo constante" },
        "streak-7": { description: "Complete sua meta por 7 dias seguidos.", title: "Semana hidratada" },
      },
      locked: "Bloqueada",
      open: "Ver conquistas",
      progress: (current, requirement) => `${current} de ${requirement}`,
      title: "Conquistas",
      unlocked: "Conquistada",
      unlockedOn: (date) => `Desbloqueada em ${date}`,
    },
    progression: {
      achievementReward: (achievement) => `Recompensa: ${achievement}`,
      description: "Acompanhe as recompensas que você ganhou construindo seu hábito.",
      drops: "Drops",
      empty: "Suas primeiras recompensas aparecerão aqui.",
      explanation: "Drops serão usados para itens e personalização. Prestige representa sua evolução real e não pode ser comprado.",
      history: "Histórico recente",
      open: "Ver Drops e Prestige",
      prestige: "Prestige",
      title: "Sua progressão",
    },
    character: {
      title: "Meu personagem",
      description: "Escolha uma aura conquistada para acompanhar seu axolote pelo Waterly.",
      open: "Personalizar personagem",
      preview: "Prévia do seu axolote com a aura selecionada",
      axolotl: "Axolote Waterly",
      auras: "AURAS",
      auraNames: { natural: "Natural", ocean: "Oceano", sunset: "Pôr do sol", stellar: "Estelar" },
      equipped: "Em uso",
      available: "Disponível para usar",
      unlockWith: (achievement) => `Desbloqueie com: ${achievement}`,
      noCost: "Auras são recompensas permanentes das suas conquistas e não gastam Drops ou Prestige.",
      loadError: "Não foi possível carregar seu personagem.",
      saveError: "Não foi possível trocar a aura.",
    },
    friends: {
      title:"Amigos",description:"Encontre pessoas pelo nome de usuário e hidrate-se em boa companhia.",open:"Amigos",search:"BUSCAR PESSOAS",searchPlaceholder:"nome_de_usuario",searchHint:"Digite pelo menos 3 caracteres.",friends:"SEUS AMIGOS",incoming:"SOLICITAÇÕES RECEBIDAS",outgoing:"SOLICITAÇÕES ENVIADAS",emptyFriends:"Você ainda não adicionou amigos.",emptyRequests:"Nenhuma solicitação por aqui.",add:"Adicionar",accept:"Aceitar",decline:"Recusar",cancel:"Cancelar",remove:"Remover",pending:"Pendente",friend:"Amigo",confirmRemove:"Toque novamente para confirmar",loadError:"Não foi possível carregar seus amigos.",actionError:"Não foi possível concluir esta ação.",
    },
    groups: {
      tabToday:"Hoje",tabGroups:"Grupos",tabProfile:"Perfil",title:"Grupos",description:"Espaços privados para construir hábitos com seus amigos.",create:"Criar grupo",name:"Nome do grupo",namePlaceholder:"Turma da hidratação",groupDescription:"Descrição",descriptionPlaceholder:"Qual é a missão deste grupo?",save:"Salvar",saving:"Salvando...",empty:"Você ainda não participa de nenhum grupo.",owner:"Proprietário",member:"Membro",members:(count)=>`${count} ${count===1?"membro":"membros"}`,addFriends:"ADICIONAR AMIGOS",noFriends:"Todos os seus amigos já estão neste grupo.",remove:"Remover",leave:"Sair do grupo",delete:"Excluir grupo",edit:"Editar grupo",confirm:"Confirmar",cancel:"Cancelar",loadError:"Não foi possível carregar os grupos.",actionError:"Não foi possível concluir esta ação.",ownerCannotLeave:"O proprietário precisa excluir o grupo para sair.",capacity:(used,limit)=>`${used} de ${limit} grupos usados`,capacityReached:"Você já está usando os dois grupos gratuitos.",invite:"CONVIDAR POR LINK",inviteDescription:"Crie um link e QR code válidos por 7 dias.",generateInvite:"Criar convite",generatingInvite:"Criando...",shareInvite:"Compartilhar convite",revokeInvite:"Revogar convite",invitation:"CONVITE PARA GRUPO",invitedBy:name=>`Convite de ${name}`,join:"Entrar no grupo",joining:"Entrando...",signInToJoin:"Entrar na conta para participar",openGroup:"Abrir grupo",notNow:"Agora não",inviteUnavailable:"Este convite não está disponível",inviteUnavailableDescription:"Ele pode ter expirado ou sido revogado pelo proprietário.",backToGroups:"Voltar para grupos",inviteExpires:date=>`Válido até ${date}`,
    },
    publicProfile: { bio: "Biografia", conflict: "Este nome de usuário já está em uso.", description: "Escolha como você aparecerá nas futuras áreas sociais do Waterly.", displayName: "Nome de exibição", open: "Meu perfil", privacy: "Idade, peso e altura continuam privados e nunca aparecem neste perfil.", save: "Salvar perfil", saveError: "Não foi possível salvar o perfil.", saving: "Salvando...", title: "Meu perfil", username: "Nome de usuário" },
    habits: {
      continueToday: "Complete sua meta hoje para continuar",
      currentStreak: (days) => `${days} ${days === 1 ? "dia seguido" : "dias seguidos"}`,
      longestStreak: (days) => `Recorde: ${days}`,
      startToday: "Complete sua meta para iniciar uma sequência",
      todayCompleted: "Meta de hoje concluída",
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
    auth: {
      eyebrow: "YOUR ACCOUNT",
      registerTitle: "Save your progress",
      registerDescription: "Create an account to keep your goal safe and access your data on other devices.",
      loginTitle: "Welcome back",
      loginDescription: "Sign in to restore your goal and continue where you left off.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      passwordHint: "Use at least 8 characters.",
      createAccount: "Create my account",
      continueWithoutAccount: "Continue without signing in",
      login: "Sign in",
      logout: "Sign out",
      haveAccount: "Already have an account?",
      needAccount: "Don’t have an account yet?",
      errors: {
        invalidEmail: "Enter a valid email address.",
        shortPassword: "Your password must have at least 8 characters.",
        registerFailed: "We couldn’t create your account. Check the details provided.",
        accountInUse: "This email is already in use. Sign in or use another email.",
        loginFailed: "Incorrect email or password.",
        serverUnavailable: "We couldn’t reach the server. Please try again shortly.",
      },
    },
    home: {
      eyebrow: "TODAY",
      title: "Your hydration",
      description: "Every glass counts toward completing today’s goal.",
      dailyTarget: "YOUR DAILY GOAL",
      consumed: "CONSUMED",
      quickAdd: "QUICK ADD",
      quickAddFor: (beverage) => `QUICK ADD · ${beverage.toUpperCase()}`,
      customAmount: "CUSTOM AMOUNT",
      customPlaceholder: "Amount in ml",
      addCustom: "Add",
      todayEntries: "TODAY'S ENTRIES",
      noEntries: "No glasses logged yet.",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      remove: "Delete",
      history: "View history",
      historyTitle: "Your history",
      historyDescription: "The latest days in your hydration journey.",
      noHistory: "No history is available yet.",
      changeError: "We couldn’t change this entry.",
      offline: "Offline",
      failedSync: (count) => `${count} ${count === 1 ? "entry failed" : "entries failed"} to sync`,
      discardFailed: "Discard failed entries",
      entrySyncFailed: "Not synced",
      entrySyncPending: "Waiting to sync",
      pendingSync: (count) => `${count} ${count === 1 ? "entry" : "entries"} waiting to sync`,
      syncing: "Syncing...",
      retrySync: "Retry sync",
      beverage: "BEVERAGE",
      beverageNames: {
        water: "Water",
        "sparkling-water": "Sparkling water",
        coffee: "Coffee",
        tea: "Tea",
      },
      waterPercentage: (value) => `${value}% water`,
      waterEquivalent: (value) => `Equivalent to ${value} of water`,
      waterEquivalentShort: (value) => `≈ ${value} water`,
      addAmount: (value) => `Add ${value}`,
      accountRequiredTitle: "Save your first glass",
      accountRequiredDescription: "Create an account to log and keep your hydration in sync.",
      loading: "Loading your hydration...",
      loadError: "We couldn’t load your hydration.",
      goalCelebration: "Goal complete! Every glass counted today.",
      mascotState: {
        complete: "Mascot celebrating the completed goal",
        empty: "Mascot resting while waiting for the first entry",
        progress: "Mascot following your progress",
      },
      addError: "We couldn’t log this glass. Please try again.",
      retry: "Try again",
      signedInAs: (email) => `Account: ${email}`,
    },
    reminders: {
      channelName: "Hydration reminders",
      daily: "Daily reminders",
      description: "Choose up to three times to receive a reminder on this device.",
      disabled: "Disabled",
      enabled: "Enabled",
      invalidTime: "Use valid times in HH:mm format.",
      localNote: "Reminders are stored only on this device and the system may make small timing adjustments.",
      notificationBody: "How about logging a drink and checking today's goal?",
      notificationTitle: "Time to hydrate",
      open: "Reminders",
      openSettings: "Open device settings",
      permissionDenied: "Notifications are blocked. Allow them in your device settings.",
      save: "Save times",
      saveError: "We couldn’t update your reminders.",
      saving: "Saving...",
      timeLabel: (position) => `Reminder time ${position}`,
      times: "TIMES",
      title: "Reminders",
      unsupported: "Local reminders are not available on the web version.",
    },
    achievements: {
      description: "Complete goals and maintain your streak to unlock new milestones.",
      empty: "No achievements are available right now.",
      items: {
        "first-goal": { description: "Complete your first daily goal.", title: "First drop" },
        "streak-3": { description: "Complete your goal for 3 days in a row.", title: "Steady rhythm" },
        "streak-7": { description: "Complete your goal for 7 days in a row.", title: "Hydrated week" },
      },
      locked: "Locked",
      open: "View achievements",
      progress: (current, requirement) => `${current} of ${requirement}`,
      title: "Achievements",
      unlocked: "Unlocked",
      unlockedOn: (date) => `Unlocked on ${date}`,
    },
    progression: {
      achievementReward: (achievement) => `Reward: ${achievement}`,
      description: "Track the rewards you earned while building your habit.",
      drops: "Drops",
      empty: "Your first rewards will appear here.",
      explanation: "Drops will be used for items and customization. Prestige represents genuine progress and cannot be purchased.",
      history: "Recent history",
      open: "View Drops and Prestige",
      prestige: "Prestige",
      title: "Your progression",
    },
    character: {
      title: "My character",
      description: "Choose an earned aura to follow your axolotl throughout Waterly.",
      open: "Customize character",
      preview: "Preview of your axolotl with the selected aura",
      axolotl: "Waterly Axolotl",
      auras: "AURAS",
      auraNames: { natural: "Natural", ocean: "Ocean", sunset: "Sunset", stellar: "Stellar" },
      equipped: "Equipped",
      available: "Available to equip",
      unlockWith: (achievement) => `Unlock with: ${achievement}`,
      noCost: "Auras are permanent achievement rewards and do not spend Drops or Prestige.",
      loadError: "We couldn’t load your character.",
      saveError: "We couldn’t change the aura.",
    },
    friends: {
      title:"Friends",description:"Find people by username and stay hydrated together.",open:"Friends",search:"FIND PEOPLE",searchPlaceholder:"username",searchHint:"Enter at least 3 characters.",friends:"YOUR FRIENDS",incoming:"RECEIVED REQUESTS",outgoing:"SENT REQUESTS",emptyFriends:"You haven't added any friends yet.",emptyRequests:"No requests here.",add:"Add",accept:"Accept",decline:"Decline",cancel:"Cancel",remove:"Remove",pending:"Pending",friend:"Friend",confirmRemove:"Tap again to confirm",loadError:"We couldn’t load your friends.",actionError:"We couldn’t complete this action.",
    },
    groups: {
      tabToday:"Today",tabGroups:"Groups",tabProfile:"Profile",title:"Groups",description:"Private spaces to build habits with your friends.",create:"Create group",name:"Group name",namePlaceholder:"Hydration crew",groupDescription:"Description",descriptionPlaceholder:"What is this group's mission?",save:"Save",saving:"Saving...",empty:"You aren't in any groups yet.",owner:"Owner",member:"Member",members:(count)=>`${count} member${count===1?"":"s"}`,addFriends:"ADD FRIENDS",noFriends:"All your friends are already in this group.",remove:"Remove",leave:"Leave group",delete:"Delete group",edit:"Edit group",confirm:"Confirm",cancel:"Cancel",loadError:"We couldn’t load the groups.",actionError:"We couldn’t complete this action.",ownerCannotLeave:"The owner must delete the group to leave.",capacity:(used,limit)=>`${used} of ${limit} groups used`,capacityReached:"You are already using both free groups.",invite:"INVITE WITH A LINK",inviteDescription:"Create a link and QR code valid for 7 days.",generateInvite:"Create invite",generatingInvite:"Creating...",shareInvite:"Share invite",revokeInvite:"Revoke invite",invitation:"GROUP INVITATION",invitedBy:name=>`Invitation from ${name}`,join:"Join group",joining:"Joining...",signInToJoin:"Sign in to join",openGroup:"Open group",notNow:"Not now",inviteUnavailable:"This invitation is unavailable",inviteUnavailableDescription:"It may have expired or been revoked by the owner.",backToGroups:"Back to groups",inviteExpires:date=>`Valid until ${date}`,
    },
    publicProfile: { bio: "Bio", conflict: "This username is already in use.", description: "Choose how you will appear in Waterly's future social areas.", displayName: "Display name", open: "My profile", privacy: "Age, weight, and height remain private and never appear on this profile.", save: "Save profile", saveError: "We couldn't save the profile.", saving: "Saving...", title: "My profile", username: "Username" },
    habits: {
      continueToday: "Complete today's goal to keep it going",
      currentStreak: (days) => `${days} day${days === 1 ? "" : "s"} in a row`,
      longestStreak: (days) => `Best: ${days}`,
      startToday: "Complete your goal to start a streak",
      todayCompleted: "Today's goal complete",
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

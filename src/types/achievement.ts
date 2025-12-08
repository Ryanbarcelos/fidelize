export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  category: "cards" | "points" | "rewards" | "streak" | "exploration" | "social";
  color: string;
  xpReward: number;
}

export interface UserProgress {
  achievementId: string;
  current: number;
  completed: boolean;
  completedAt?: string;
}

export interface AchievementData {
  achievements: Achievement[];
  progress: UserProgress[];
  lastAccessDate?: string;
  currentStreak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Cards Category
  {
    id: "first_card",
    title: "Primeiro Passo",
    description: "Adicione seu primeiro cartão de fidelidade",
    icon: "🎯",
    target: 1,
    category: "cards",
    color: "from-emerald-500 to-emerald-600",
    xpReward: 10,
  },
  {
    id: "collector_beginner",
    title: "Colecionador Iniciante",
    description: "Adicione 5 cartões de fidelidade",
    icon: "📇",
    target: 5,
    category: "cards",
    color: "from-blue-500 to-blue-600",
    xpReward: 25,
  },
  {
    id: "collector_master",
    title: "Mestre Colecionador",
    description: "Adicione 10 cartões de fidelidade",
    icon: "🏆",
    target: 10,
    category: "cards",
    color: "from-indigo-500 to-indigo-600",
    xpReward: 50,
  },

  // Points Category
  {
    id: "loyal_customer",
    title: "Cliente Fiel",
    description: "Acumule 50 pontos no total",
    icon: "⭐",
    target: 50,
    category: "points",
    color: "from-yellow-500 to-yellow-600",
    xpReward: 30,
  },
  {
    id: "points_hunter",
    title: "Caçador de Pontos",
    description: "Acumule 200 pontos no total",
    icon: "💎",
    target: 200,
    category: "points",
    color: "from-cyan-500 to-cyan-600",
    xpReward: 75,
  },
  {
    id: "points_master",
    title: "Mestre dos Pontos",
    description: "Acumule 500 pontos no total",
    icon: "👑",
    target: 500,
    category: "points",
    color: "from-amber-500 to-amber-600",
    xpReward: 150,
  },

  // Rewards Category
  {
    id: "first_reward",
    title: "Primeira Recompensa",
    description: "Colete sua primeira recompensa",
    icon: "🎁",
    target: 1,
    category: "rewards",
    color: "from-pink-500 to-pink-600",
    xpReward: 15,
  },
  {
    id: "reward_champion",
    title: "Campeão de Fidelidade",
    description: "Colete 5 recompensas",
    icon: "🏅",
    target: 5,
    category: "rewards",
    color: "from-purple-500 to-purple-600",
    xpReward: 50,
  },
  {
    id: "reward_legend",
    title: "Lenda das Recompensas",
    description: "Colete 15 recompensas",
    icon: "🌟",
    target: 15,
    category: "rewards",
    color: "from-violet-500 to-violet-600",
    xpReward: 100,
  },

  // Streak Category
  {
    id: "streak_starter",
    title: "Começo Promissor",
    description: "Acesse o app por 3 dias consecutivos",
    icon: "🔥",
    target: 3,
    category: "streak",
    color: "from-orange-500 to-orange-600",
    xpReward: 20,
  },
  {
    id: "dedicated_user",
    title: "Usuário Dedicado",
    description: "Acesse o app por 7 dias consecutivos",
    icon: "💪",
    target: 7,
    category: "streak",
    color: "from-red-500 to-red-600",
    xpReward: 50,
  },
  {
    id: "streak_master",
    title: "Mestre da Consistência",
    description: "Acesse o app por 30 dias consecutivos",
    icon: "⚡",
    target: 30,
    category: "streak",
    color: "from-rose-500 to-rose-600",
    xpReward: 200,
  },

  // Exploration Category
  {
    id: "explorer",
    title: "Explorador",
    description: "Visite a página de lojas próximas",
    icon: "🗺️",
    target: 1,
    category: "exploration",
    color: "from-teal-500 to-teal-600",
    xpReward: 10,
  },
  {
    id: "profile_complete",
    title: "Perfil Completo",
    description: "Acesse todas as seções do app",
    icon: "✅",
    target: 5,
    category: "exploration",
    color: "from-green-500 to-green-600",
    xpReward: 25,
  },
];

// Level titles based on level number
export const LEVEL_TITLES: { [key: number]: string } = {
  0: "Novato",
  1: "Iniciante",
  2: "Aprendiz",
  3: "Explorador",
  4: "Fidelizado",
  5: "Experiente",
  6: "Veterano",
  7: "Expert",
  8: "Mestre",
  9: "Grão-Mestre",
  10: "Lendário",
};

export const getLevelTitle = (level: number): string => {
  if (level >= 10) return LEVEL_TITLES[10];
  return LEVEL_TITLES[level] || "Novato";
};

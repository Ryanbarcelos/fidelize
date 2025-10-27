export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  category: "cards" | "points" | "rewards" | "streak";
  color: string;
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
  {
    id: "collector_beginner",
    title: "Colecionador Iniciante",
    description: "Adicione 5 cartões de fidelidade",
    icon: "🎯",
    target: 5,
    category: "cards",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "loyal_customer",
    title: "Cliente Fiel",
    description: "Acumule 50 pontos no total",
    icon: "⭐",
    target: 50,
    category: "points",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "reward_champion",
    title: "Campeão de Fidelidade",
    description: "Colete 3 recompensas",
    icon: "🏅",
    target: 3,
    category: "rewards",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "dedicated_user",
    title: "Usuário Dedicado",
    description: "Acesse o app por 7 dias consecutivos",
    icon: "🔥",
    target: 7,
    category: "streak",
    color: "from-orange-500 to-orange-600",
  },
];

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredRewards: number;
  color: string;
}

export interface GamificationData {
  totalRewardsCollected: number;
  currentLevel: number;
  currentXP: number;
  medals: string[]; // IDs das medalhas desbloqueadas
}

const MEDALS: Medal[] = [
  {
    id: "bronze",
    name: "Bronze",
    description: "3 recompensas resgatadas",
    icon: "🥉",
    requiredRewards: 3,
    color: "from-orange-600 to-orange-700",
  },
  {
    id: "silver",
    name: "Prata",
    description: "7 recompensas resgatadas",
    icon: "🥈",
    requiredRewards: 7,
    color: "from-gray-400 to-gray-500",
  },
  {
    id: "gold",
    name: "Ouro",
    description: "12 recompensas resgatadas",
    icon: "🥇",
    requiredRewards: 12,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "vip",
    name: "VIP",
    description: "20 recompensas resgatadas",
    icon: "🌟",
    requiredRewards: 20,
    color: "from-purple-500 to-purple-600",
  },
];

const INITIAL_DATA: GamificationData = {
  totalRewardsCollected: 0,
  currentLevel: 0,
  currentXP: 0,
  medals: [],
};

// Calcula o XP necessário para o próximo nível
const getXPForLevel = (level: number): number => {
  if (level === 0) return 3;
  if (level === 1) return 6;
  if (level === 2) return 12;
  // Para níveis superiores: dobra a cada nível
  return Math.pow(2, level) * 3;
};

// Calcula o nível baseado no total de recompensas
const calculateLevel = (totalRewards: number): number => {
  let level = 0;
  let xpNeeded = 0;
  
  while (totalRewards >= xpNeeded + getXPForLevel(level)) {
    xpNeeded += getXPForLevel(level);
    level++;
  }
  
  return level;
};

export const useGamification = () => {
  const [gamificationData, setGamificationData] = useLocalStorage<GamificationData>(
    "gamification-data",
    INITIAL_DATA
  );
  const [newlyUnlocked, setNewlyUnlocked] = useState<{ medals: Medal[]; levelUp: boolean }>({
    medals: [],
    levelUp: false,
  });

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const checkMedals = useCallback((totalRewards: number, previousTotal: number) => {
    const newMedals: Medal[] = [];
    
    MEDALS.forEach((medal) => {
      if (
        totalRewards >= medal.requiredRewards &&
        previousTotal < medal.requiredRewards &&
        !gamificationData.medals.includes(medal.id)
      ) {
        newMedals.push(medal);
      }
    });

    if (newMedals.length > 0) {
      setGamificationData((prev) => ({
        ...prev,
        medals: [...prev.medals, ...newMedals.map((m) => m.id)],
      }));

      // Mostrar notificação para cada medalha
      newMedals.forEach((medal) => {
        setTimeout(() => {
          triggerCelebration();
          toast.success(`🏆 Nova Medalha Desbloqueada: ${medal.name}!`, {
            description: medal.description,
            duration: 5000,
          });
        }, 500);
      });

      setNewlyUnlocked((prev) => ({ ...prev, medals: newMedals }));
    }
  }, [gamificationData.medals, setGamificationData, triggerCelebration]);

  const addReward = useCallback(() => {
    const previousTotal = gamificationData.totalRewardsCollected;
    const newTotal = previousTotal + 1;
    const previousLevel = calculateLevel(previousTotal);
    const newLevel = calculateLevel(newTotal);

    setGamificationData({
      totalRewardsCollected: newTotal,
      currentLevel: newLevel,
      currentXP: newTotal,
      medals: gamificationData.medals,
    });

    // Verificar se subiu de nível
    if (newLevel > previousLevel) {
      setTimeout(() => {
        triggerCelebration();
        toast.success(`🎉 Nível ${newLevel} Alcançado!`, {
          description: `Continue coletando recompensas para subir de nível!`,
          duration: 5000,
        });
      }, 1000);
      setNewlyUnlocked((prev) => ({ ...prev, levelUp: true }));
    }

    // Verificar medalhas
    checkMedals(newTotal, previousTotal);
  }, [gamificationData, setGamificationData, triggerCelebration, checkMedals]);

  const getXPProgress = useCallback(() => {
    const level = gamificationData.currentLevel;
    const totalXP = gamificationData.currentXP;
    
    // Calcula quanto XP foi necessário para chegar no nível atual
    let xpForCurrentLevel = 0;
    for (let i = 0; i < level; i++) {
      xpForCurrentLevel += getXPForLevel(i);
    }
    
    const currentLevelXP = totalXP - xpForCurrentLevel;
    const xpNeededForNext = getXPForLevel(level);
    const progress = (currentLevelXP / xpNeededForNext) * 100;
    
    return {
      current: currentLevelXP,
      needed: xpNeededForNext,
      progress: Math.min(progress, 100),
    };
  }, [gamificationData]);

  const getUnlockedMedals = useCallback(() => {
    return MEDALS.filter((medal) => gamificationData.medals.includes(medal.id));
  }, [gamificationData.medals]);

  const getNextMedal = useCallback(() => {
    return MEDALS.find(
      (medal) => !gamificationData.medals.includes(medal.id)
    );
  }, [gamificationData.medals]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked({ medals: [], levelUp: false });
  }, []);

  return {
    level: gamificationData.currentLevel,
    totalRewards: gamificationData.totalRewardsCollected,
    medals: MEDALS,
    unlockedMedals: getUnlockedMedals(),
    nextMedal: getNextMedal(),
    xpProgress: getXPProgress(),
    addReward,
    newlyUnlocked,
    clearNewlyUnlocked,
  };
};

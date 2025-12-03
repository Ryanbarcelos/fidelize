import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<{ medals: Medal[]; levelUp: boolean }>({
    medals: [],
    levelUp: false,
  });

  const fetchGamificationData = async () => {
    if (!user) return;
    
    try {
      // Fetch gamification data
      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Also fetch actual redeemed promotions count for accuracy
      const { count: redeemedCount } = await supabase
        .from("earned_promotions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_redeemed", true);

      if (data) {
        // Use the higher value between stored and actual count
        const actualRewards = Math.max(data.total_rewards_collected, redeemedCount || 0);
        const actualLevel = calculateLevel(actualRewards);
        
        // Update if there's a discrepancy
        if (actualRewards !== data.total_rewards_collected || actualLevel !== data.current_level) {
          await supabase
            .from("user_gamification")
            .update({
              total_rewards_collected: actualRewards,
              current_level: actualLevel,
              current_xp: actualRewards,
            })
            .eq("user_id", user.id);
        }

        setGamificationData({
          totalRewardsCollected: actualRewards,
          currentLevel: actualLevel,
          currentXP: actualRewards,
          medals: data.medals || [],
        });
      } else {
        // Initialize gamification data for new users
        const { error: insertError } = await supabase
          .from("user_gamification")
          .insert({
            user_id: user.id,
            total_rewards_collected: redeemedCount || 0,
            current_level: calculateLevel(redeemedCount || 0),
            current_xp: redeemedCount || 0,
            medals: [],
          });

        if (insertError) throw insertError;
        
        setGamificationData({
          totalRewardsCollected: redeemedCount || 0,
          currentLevel: calculateLevel(redeemedCount || 0),
          currentXP: redeemedCount || 0,
          medals: [],
        });
      }
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gamification data from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchGamificationData();

    // Real-time subscription for automatic updates
    const channel = supabase
      .channel('gamification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'earned_promotions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGamificationData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGamificationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const checkMedals = useCallback(async (totalRewards: number, previousTotal: number) => {
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

    if (newMedals.length > 0 && user) {
      const updatedMedals = [...gamificationData.medals, ...newMedals.map((m) => m.id)];
      
      try {
        await supabase
          .from("user_gamification")
          .update({ medals: updatedMedals })
          .eq("user_id", user.id);

        setGamificationData((prev) => ({
          ...prev,
          medals: updatedMedals,
        }));

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
      } catch (error) {
        console.error("Error updating medals:", error);
      }
    }
  }, [gamificationData.medals, user, triggerCelebration]);

  const addReward = useCallback(async () => {
    if (!user) return;

    const previousTotal = gamificationData.totalRewardsCollected;
    const newTotal = previousTotal + 1;
    const previousLevel = calculateLevel(previousTotal);
    const newLevel = calculateLevel(newTotal);

    try {
      await supabase
        .from("user_gamification")
        .update({
          total_rewards_collected: newTotal,
          current_level: newLevel,
          current_xp: newTotal,
        })
        .eq("user_id", user.id);

      setGamificationData({
        totalRewardsCollected: newTotal,
        currentLevel: newLevel,
        currentXP: newTotal,
        medals: gamificationData.medals,
      });

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

      checkMedals(newTotal, previousTotal);
    } catch (error) {
      console.error("Error adding reward:", error);
      toast.error("Erro ao adicionar recompensa");
    }
  }, [user, gamificationData, triggerCelebration, checkMedals]);

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
    loading,
  };
};

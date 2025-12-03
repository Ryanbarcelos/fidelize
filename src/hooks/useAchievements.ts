import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFidelityCards } from "./useFidelityCards";
import { AchievementData, ACHIEVEMENTS, UserProgress } from "@/types/achievement";
import confetti from "canvas-confetti";
import { toast } from "sonner";

const INITIAL_ACHIEVEMENT_DATA: AchievementData = {
  achievements: ACHIEVEMENTS,
  progress: ACHIEVEMENTS.map((achievement) => ({
    achievementId: achievement.id,
    current: 0,
    completed: false,
  })),
  lastAccessDate: new Date().toDateString(),
  currentStreak: 1,
};

export const useAchievements = () => {
  const { user } = useAuth();
  const { cards: fidelityCards } = useFidelityCards();
  const [achievementData, setAchievementData] = useState<AchievementData>(INITIAL_ACHIEVEMENT_DATA);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Fetch achievements from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from("user_achievements")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const progress: UserProgress[] = data.map((item) => ({
            achievementId: item.achievement_id,
            current: item.current,
            completed: item.completed,
            completedAt: item.completed_at || undefined,
          }));

          // Get streak data from user_gamification
          const { data: gamData } = await supabase
            .from("user_gamification")
            .select("last_access_date, current_streak")
            .eq("user_id", user.id)
            .maybeSingle();

          setAchievementData({
            achievements: ACHIEVEMENTS,
            progress,
            lastAccessDate: gamData?.last_access_date || new Date().toDateString(),
            currentStreak: gamData?.current_streak || 1,
          });
        } else {
          // Initialize achievements for new users
          const insertPromises = ACHIEVEMENTS.map((achievement) =>
            supabase.from("user_achievements").insert({
              user_id: user.id,
              achievement_id: achievement.id,
              current: 0,
              completed: false,
            })
          );

          await Promise.all(insertPromises);

          // Initialize gamification data if not exists
          const { data: existingGam } = await supabase
            .from("user_gamification")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingGam) {
            await supabase.from("user_gamification").insert({
              user_id: user.id,
              last_access_date: new Date().toISOString().split('T')[0],
              current_streak: 1,
            });
          }

          setAchievementData(INITIAL_ACHIEVEMENT_DATA);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  // Check and update streak
  useEffect(() => {
    if (!user || loading) return;

    const checkStreak = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastAccess = achievementData.lastAccessDate;

      if (lastAccess !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastAccess === yesterdayStr 
          ? achievementData.currentStreak + 1 
          : 1;

        try {
          await supabase
            .from("user_gamification")
            .update({
              last_access_date: today,
              current_streak: newStreak,
            })
            .eq("user_id", user.id);

          setAchievementData((prev) => ({
            ...prev,
            lastAccessDate: today,
            currentStreak: newStreak,
          }));

          // Also update the streak achievement
          await updateAchievementProgress("dedicated_user", newStreak);
        } catch (error) {
          console.error("Error updating streak:", error);
        }
      }
    };

    checkStreak();
  }, [user, loading]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const updateAchievementProgress = useCallback(async (achievementId: string, currentValue: number) => {
    if (!user) return;

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const progressIndex = achievementData.progress.findIndex(
      (p) => p.achievementId === achievementId
    );

    if (progressIndex === -1) return;

    const currentProgress = achievementData.progress[progressIndex];

    // Already completed, no need to update
    if (currentProgress.completed) return;

    const isCompleted = currentValue >= achievement.target;

    try {
      await supabase
        .from("user_achievements")
        .update({
          current: currentValue,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId);

      const updatedProgress = [...achievementData.progress];
      updatedProgress[progressIndex] = {
        ...currentProgress,
        current: currentValue,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
      };

      setAchievementData((prev) => ({
        ...prev,
        progress: updatedProgress,
      }));

      if (isCompleted && !currentProgress.completed) {
        triggerCelebration();
        setNewlyUnlocked((prev) => [...prev, achievementId]);
        toast.success(`🎉 Conquista desbloqueada: ${achievement.title}!`, {
          description: achievement.description,
          duration: 5000,
        });

        // Create notification for achievement
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: `🎉 Conquista Desbloqueada!`,
          description: `Você completou a conquista "${achievement.title}": ${achievement.description}`,
          store_name: "Fidelize",
          notification_type: "achievement",
        });
      }
    } catch (error) {
      console.error("Error updating achievement:", error);
    }
  }, [user, achievementData.progress]);

  // Auto-update achievements based on fidelity cards
  useEffect(() => {
    if (!user || loading || fidelityCards.length === 0) return;

    const updateAllAchievements = async () => {
      // Count total fidelity cards
      const totalCards = fidelityCards.length;
      await updateAchievementProgress("collector_beginner", totalCards);

      // Sum total balance (points) across all fidelity cards
      const totalPoints = fidelityCards.reduce((sum, card) => sum + (card.balance || 0), 0);
      await updateAchievementProgress("loyal_customer", totalPoints);

      // Check streak
      await updateAchievementProgress("dedicated_user", achievementData.currentStreak);
    };

    updateAllAchievements();
  }, [user, loading, fidelityCards, achievementData.currentStreak]);

  const incrementRewardsCollected = useCallback(async () => {
    if (!user) return;

    const rewardsProgress = achievementData.progress.find(
      (p) => p.achievementId === "reward_champion"
    );

    if (rewardsProgress && !rewardsProgress.completed) {
      const newCount = rewardsProgress.current + 1;
      await updateAchievementProgress("reward_champion", newCount);
    }
  }, [user, achievementData.progress, updateAchievementProgress]);

  const clearNewlyUnlocked = () => {
    setNewlyUnlocked([]);
  };

  const getProgress = (achievementId: string): UserProgress | undefined => {
    return achievementData.progress.find((p) => p.achievementId === achievementId);
  };

  const getCompletedCount = (): number => {
    return achievementData.progress.filter((p) => p.completed).length;
  };

  return {
    achievements: ACHIEVEMENTS,
    progress: achievementData.progress,
    incrementRewardsCollected,
    newlyUnlocked,
    clearNewlyUnlocked,
    getProgress,
    getCompletedCount,
    currentStreak: achievementData.currentStreak,
    loading,
  };
};

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCards } from "./useCards";
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
  const { cards } = useCards();
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
    if (!user) return;

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
        } catch (error) {
          console.error("Error updating streak:", error);
        }
      }
    };

    checkStreak();
  }, [user, achievementData.lastAccessDate, achievementData.currentStreak]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const checkAchievement = useCallback(async (achievementId: string, currentValue: number) => {
    if (!user) return;

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const progressIndex = achievementData.progress.findIndex(
      (p) => p.achievementId === achievementId
    );

    if (progressIndex === -1) return;

    const currentProgress = achievementData.progress[progressIndex];

    if (!currentProgress.completed && currentValue >= achievement.target) {
      try {
        await supabase
          .from("user_achievements")
          .update({
            current: currentValue,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("achievement_id", achievementId);

        const updatedProgress = [...achievementData.progress];
        updatedProgress[progressIndex] = {
          ...currentProgress,
          current: currentValue,
          completed: true,
          completedAt: new Date().toISOString(),
        };

        setAchievementData((prev) => ({
          ...prev,
          progress: updatedProgress,
        }));

        triggerCelebration();
        setNewlyUnlocked((prev) => [...prev, achievementId]);

        toast.success(`🎉 Conquista desbloqueada: ${achievement.title}!`, {
          description: achievement.description,
          duration: 5000,
        });
      } catch (error) {
        console.error("Error updating achievement:", error);
      }
    } else if (!currentProgress.completed && currentProgress.current !== currentValue) {
      try {
        await supabase
          .from("user_achievements")
          .update({ current: currentValue })
          .eq("user_id", user.id)
          .eq("achievement_id", achievementId);

        const updatedProgress = [...achievementData.progress];
        updatedProgress[progressIndex] = {
          ...currentProgress,
          current: currentValue,
        };

        setAchievementData((prev) => ({
          ...prev,
          progress: updatedProgress,
        }));
      } catch (error) {
        console.error("Error updating achievement progress:", error);
      }
    }
  }, [user, achievementData.progress]);

  const updateAchievements = useCallback(() => {
    // Count total cards
    const totalCards = cards.length;
    checkAchievement("collector_beginner", totalCards);

    // Count total points across all cards
    const totalPoints = cards.reduce((sum, card) => sum + card.points, 0);
    checkAchievement("loyal_customer", totalPoints);

    // Check streak
    checkAchievement("dedicated_user", achievementData.currentStreak);
  }, [cards, achievementData.currentStreak, checkAchievement]);

  const incrementRewardsCollected = useCallback(async () => {
    if (!user) return;

    const rewardsProgress = achievementData.progress.find(
      (p) => p.achievementId === "rewards_hunter"
    );

    if (rewardsProgress) {
      const newCount = rewardsProgress.current + 1;
      await checkAchievement("rewards_hunter", newCount);
    }
  }, [user, achievementData.progress, checkAchievement]);

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
    updateAchievements,
    incrementRewardsCollected,
    newlyUnlocked,
    clearNewlyUnlocked,
    getProgress,
    getCompletedCount,
    currentStreak: achievementData.currentStreak,
    loading,
  };
};

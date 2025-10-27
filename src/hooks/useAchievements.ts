import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { LoyaltyCard } from "@/types/card";
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
  const [achievementData, setAchievementData] = useLocalStorage<AchievementData>(
    "achievements",
    INITIAL_ACHIEVEMENT_DATA
  );
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastAccess = achievementData.lastAccessDate;

    if (lastAccess !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const newStreak = lastAccess === yesterdayStr 
        ? achievementData.currentStreak + 1 
        : 1;

      setAchievementData({
        ...achievementData,
        lastAccessDate: today,
        currentStreak: newStreak,
      });
    }
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const checkAchievement = useCallback((achievementId: string, currentValue: number) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const progressIndex = achievementData.progress.findIndex(
      (p) => p.achievementId === achievementId
    );

    if (progressIndex === -1) return;

    const currentProgress = achievementData.progress[progressIndex];

    if (!currentProgress.completed && currentValue >= achievement.target) {
      const updatedProgress = [...achievementData.progress];
      updatedProgress[progressIndex] = {
        ...currentProgress,
        current: currentValue,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      setAchievementData({
        ...achievementData,
        progress: updatedProgress,
      });

      // Trigger celebration
      triggerCelebration();
      setNewlyUnlocked((prev) => [...prev, achievementId]);

      // Show toast notification
      toast.success(`🎉 Conquista desbloqueada: ${achievement.title}!`, {
        description: achievement.description,
        duration: 5000,
      });
    } else if (!currentProgress.completed) {
      // Update progress without completing
      const updatedProgress = [...achievementData.progress];
      updatedProgress[progressIndex] = {
        ...currentProgress,
        current: currentValue,
      };

      setAchievementData({
        ...achievementData,
        progress: updatedProgress,
      });
    }
  }, [achievementData, setAchievementData]);

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

  const incrementRewardsCollected = useCallback(() => {
    const rewardsProgress = achievementData.progress.find(
      (p) => p.achievementId === "reward_champion"
    );
    
    if (rewardsProgress && !rewardsProgress.completed) {
      checkAchievement("reward_champion", rewardsProgress.current + 1);
    }
  }, [achievementData.progress, checkAchievement]);

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
  };
};

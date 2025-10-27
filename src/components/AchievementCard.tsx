import { Achievement, UserProgress } from "@/types/achievement";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface AchievementCardProps {
  achievement: Achievement;
  progress: UserProgress;
}

export const AchievementCard = ({ achievement, progress }: AchievementCardProps) => {
  const progressPercentage = Math.min((progress.current / achievement.target) * 100, 100);
  const isCompleted = progress.completed;

  return (
    <Card
      className={`p-5 border-0 shadow-md rounded-2xl transition-all duration-300 hover:shadow-lg ${
        isCompleted 
          ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900" 
          : "bg-card"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <span className="text-3xl">{achievement.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-base mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
            {isCompleted && (
              <div className="ml-2 w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progresso</span>
              <span className="font-semibold">
                {progress.current}/{achievement.target}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {progressPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

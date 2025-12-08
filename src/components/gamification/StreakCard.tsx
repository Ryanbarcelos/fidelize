import { Card } from "@/components/ui/card";
import { Flame, Calendar, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  currentStreak: number;
  className?: string;
}

export const StreakCard = ({ currentStreak, className }: StreakCardProps) => {
  const getStreakMessage = () => {
    if (currentStreak >= 30) return "Você é imparável! 🔥";
    if (currentStreak >= 14) return "Incrível dedicação!";
    if (currentStreak >= 7) return "Sequência fantástica!";
    if (currentStreak >= 3) return "Continue assim!";
    return "Mantenha a sequência!";
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return "from-rose-500 to-orange-500";
    if (currentStreak >= 14) return "from-orange-500 to-amber-500";
    if (currentStreak >= 7) return "from-amber-500 to-yellow-500";
    if (currentStreak >= 3) return "from-yellow-500 to-lime-500";
    return "from-blue-500 to-cyan-500";
  };

  // Generate last 7 days streak indicators
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    const isActive = day <= currentStreak % 7 || (currentStreak >= 7 && currentStreak % 7 === 0);
    const isCurrent = day === (currentStreak % 7 || 7);
    return { day, isActive: day <= Math.min(currentStreak, 7), isCurrent: day === Math.min(currentStreak, 7) };
  });

  return (
    <Card className={cn(
      "p-4 border-0 shadow-md rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 cursor-pointer hover:shadow-lg transition-all",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
            getStreakColor()
          )}>
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
            <p className="text-sm text-muted-foreground">{getStreakMessage()}</p>
          </div>
        </div>

        {/* Mini streak indicator */}
        <div className="flex gap-1">
          {streakDays.map(({ day, isActive, isCurrent }) => (
            <div
              key={day}
              className={cn(
                "w-2 h-6 rounded-full transition-all",
                isActive 
                  ? `bg-gradient-to-b ${getStreakColor()}`
                  : "bg-muted",
                isCurrent && "ring-2 ring-orange-400 ring-offset-1"
              )}
            />
          ))}
        </div>
      </div>

      {/* Bonus message for milestones */}
      {(currentStreak === 7 || currentStreak === 14 || currentStreak === 30) && (
        <div className="mt-3 p-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Marco de {currentStreak} dias alcançado! 🎉
          </span>
        </div>
      )}
    </Card>
  );
};

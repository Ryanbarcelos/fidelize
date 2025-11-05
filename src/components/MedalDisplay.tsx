import { Card } from "@/components/ui/card";
import { Medal } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

interface MedalDisplayProps {
  medals: Medal[];
  unlockedMedals: Medal[];
  className?: string;
}

export const MedalDisplay = ({ medals, unlockedMedals, className }: MedalDisplayProps) => {
  const isUnlocked = (medalId: string) => 
    unlockedMedals.some(m => m.id === medalId);

  return (
    <div className={cn("grid grid-cols-2 gap-5", className)}>
      {medals.map((medal) => {
        const unlocked = isUnlocked(medal.id);
        
        return (
          <Card
            key={medal.id}
            className={cn(
              "p-6 border-0 shadow-premium-lg rounded-3xl transition-all duration-500",
              unlocked
                ? `bg-gradient-to-br ${medal.color} hover-scale`
                : "bg-muted/30 opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-premium",
                unlocked 
                  ? "bg-white/20 backdrop-blur-md border-2 border-white/40" 
                  : "bg-muted"
              )}>
                <span className="text-5xl filter drop-shadow-lg">
                  {unlocked ? medal.icon : "🔒"}
                </span>
              </div>
              <div>
                <p className={cn(
                  "font-bold text-base mb-1",
                  unlocked ? "text-white drop-shadow-md" : "text-muted-foreground"
                )}>
                  {medal.name}
                </p>
                <p className={cn(
                  "text-xs leading-relaxed",
                  unlocked ? "text-white/90 drop-shadow-sm" : "text-muted-foreground"
                )}>
                  {medal.description}
                </p>
              </div>
              {unlocked && (
                <div className="bg-white/25 backdrop-blur-md rounded-2xl px-4 py-1.5 border border-white/40 shadow-lg">
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    Desbloqueada ✓
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

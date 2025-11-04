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
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {medals.map((medal) => {
        const unlocked = isUnlocked(medal.id);
        
        return (
          <Card
            key={medal.id}
            className={cn(
              "p-4 border-0 shadow-md rounded-2xl transition-all",
              unlocked
                ? `bg-gradient-to-br ${medal.color}`
                : "bg-muted/30 opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                unlocked 
                  ? "bg-white/20 backdrop-blur-sm border border-white/30" 
                  : "bg-muted"
              )}>
                <span className="text-4xl filter drop-shadow-md">
                  {unlocked ? medal.icon : "🔒"}
                </span>
              </div>
              <div>
                <p className={cn(
                  "font-bold text-sm",
                  unlocked ? "text-white" : "text-muted-foreground"
                )}>
                  {medal.name}
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  unlocked ? "text-white/90" : "text-muted-foreground"
                )}>
                  {medal.description}
                </p>
              </div>
              {unlocked && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                  <span className="text-white text-xs font-medium">
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

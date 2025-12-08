import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface DailyCheckInProps {
  hasCheckedIn: boolean;
  onCheckIn: () => Promise<void>;
  currentStreak: number;
  className?: string;
}

export const DailyCheckIn = ({ 
  hasCheckedIn, 
  onCheckIn, 
  currentStreak,
  className 
}: DailyCheckInProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckIn = async () => {
    if (hasCheckedIn || isChecking) return;
    
    setIsChecking(true);
    try {
      await onCheckIn();
      setShowSuccess(true);
      
      // Celebration effect
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ef4444', '#8b5cf6'],
      });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsChecking(false);
    }
  };

  // Generate week days
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const today = new Date().getDay();

  return (
    <Card className={cn(
      "p-4 border-0 shadow-md rounded-2xl overflow-hidden relative",
      hasCheckedIn 
        ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
        : "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
              hasCheckedIn 
                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                : "bg-gradient-to-br from-violet-500 to-purple-500"
            )}>
              {hasCheckedIn ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Gift className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {hasCheckedIn ? "Check-in feito!" : "Check-in Diário"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {hasCheckedIn 
                  ? `Sequência de ${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`
                  : "Ganhe XP bônus diário"}
              </p>
            </div>
          </div>

          {!hasCheckedIn && (
            <Button
              size="sm"
              onClick={handleCheckIn}
              disabled={isChecking}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-md"
            >
              {isChecking ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Fazer
                </>
              )}
            </Button>
          )}
        </div>

        {/* Week progress */}
        <div className="flex justify-between gap-1">
          {weekDays.map((day, index) => {
            const isPast = index < today;
            const isToday = index === today;
            const isActive = isPast || (isToday && hasCheckedIn);
            
            return (
              <div
                key={index}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-center text-xs font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-b from-green-400 to-green-500 text-white shadow-sm"
                    : isToday
                      ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-500/90 flex items-center justify-center animate-fade-in">
          <div className="text-center text-white">
            <Check className="w-10 h-10 mx-auto mb-2" />
            <p className="font-bold">+10 XP</p>
          </div>
        </div>
      )}
    </Card>
  );
};

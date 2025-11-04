import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export const LevelBadge = ({ 
  level, 
  size = "md", 
  className,
  showLabel = true 
}: LevelBadgeProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn(
        "rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg border-2 border-white/20",
        sizeClasses[size]
      )}>
        <div className="flex items-center gap-1 text-white font-bold">
          <Trophy className={iconSizes[size]} />
          {level}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          Nível {level}
        </span>
      )}
    </div>
  );
};

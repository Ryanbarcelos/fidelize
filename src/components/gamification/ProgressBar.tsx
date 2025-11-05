import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({ 
  current, 
  max, 
  className,
  showLabel = true,
  size = "md"
}: ProgressBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }[size];

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
        <Progress 
          value={percentage} 
          className={cn("bg-transparent transition-all duration-700 ease-out", heightClass)}
        />
        {/* Glow effect on progress */}
        {percentage > 0 && (
          <div 
            className="absolute top-0 left-0 h-full bg-white/20 rounded-full blur-sm transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
            {current}/{max} pontos
          </span>
          <span className="text-xs font-bold text-white drop-shadow-sm">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
};

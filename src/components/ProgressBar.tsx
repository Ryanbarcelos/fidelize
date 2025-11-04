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
    <div className={cn("w-full space-y-1", className)}>
      <Progress 
        value={percentage} 
        className={cn("bg-white/20", heightClass)}
      />
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-white/90">
            {current}/{max} pontos
          </span>
          <span className="text-xs font-medium text-white/90">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
};

import { cn } from "@/lib/utils";
import { Zap, Star } from "lucide-react";
import { getLevelTitle } from "@/types/achievement";

interface XPProgressBarProps {
  level: number;
  current: number;
  needed: number;
  progress: number;
  compact?: boolean;
  className?: string;
}

export const XPProgressBar = ({
  level,
  current,
  needed,
  progress,
  compact = false,
  className,
}: XPProgressBarProps) => {
  const levelTitle = getLevelTitle(level);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">{level}</span>
        </div>
        <div className="flex-1 max-w-32">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {current}/{needed}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-2xl px-4 py-3 border border-primary/20 shadow-premium",
      className
    )}>
      <div className="relative">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">{level}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white dark:border-card">
          <Star className="w-3 h-3 text-white fill-white" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-foreground">{levelTitle}</span>
          <span className="text-xs text-muted-foreground">
            {current}/{needed} XP
          </span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary-light to-primary rounded-full transition-all duration-1000 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add shimmer animation if not exists
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;
if (!document.querySelector('[data-xp-shimmer]')) {
  style.setAttribute('data-xp-shimmer', 'true');
  document.head.appendChild(style);
}

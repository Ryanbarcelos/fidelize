import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";

const Achievements = () => {
  const navigate = useNavigate();
  const { achievements, progress, getProgress, getCompletedCount } = useAchievements();
  const completedCount = getCompletedCount();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Metas e Conquistas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Summary Card */}
        <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {completedCount}/{achievements.length}
              </h2>
              <p className="text-muted-foreground">
                {completedCount === achievements.length 
                  ? "Todas as conquistas desbloqueadas! 🎉"
                  : "Conquistas completadas"}
              </p>
            </div>
          </div>
        </Card>

        {/* Achievements List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Suas Metas
          </h3>
          {achievements.map((achievement) => {
            const achievementProgress = getProgress(achievement.id);
            if (!achievementProgress) return null;

            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                progress={achievementProgress}
              />
            );
          })}
        </div>

        {/* Completed Badges Section */}
        {completedCount > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Minhas Conquistas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {achievements
                .filter((achievement) => {
                  const prog = getProgress(achievement.id);
                  return prog?.completed;
                })
                .map((achievement) => (
                  <Card
                    key={achievement.id}
                    className="p-4 border-0 shadow-md rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex flex-col items-center justify-center"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg mb-2`}>
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <p className="text-xs text-center font-medium text-foreground">
                      {achievement.title}
                    </p>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Achievements;

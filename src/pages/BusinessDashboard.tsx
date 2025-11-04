import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { 
  Store, 
  Users, 
  TrendingUp, 
  Gift, 
  QrCode, 
  Megaphone,
  UserCircle,
  BarChart3
} from "lucide-react";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== 'business') {
      navigate("/login");
      return;
    }
    setIsVisible(true);
  }, [currentUser, navigate]);

  // Calculate store stats
  const storeStats = useMemo(() => {
    const storeName = currentUser?.storeName || "";
    const storeCards = cards.filter(c => c.storeName === storeName);
    
    // Total clients
    const totalClients = storeCards.length;
    
    // Points added today
    const today = new Date().toDateString();
    let pointsAddedToday = 0;
    storeCards.forEach(card => {
      card.transactions?.forEach(t => {
        if (t.type === 'points_added' && new Date(t.timestamp).toDateString() === today) {
          pointsAddedToday += t.points;
        }
      });
    });
    
    // Total rewards collected
    let rewardsCollected = 0;
    storeCards.forEach(card => {
      rewardsCollected += (card.transactions?.filter(t => t.type === 'reward_collected').length || 0);
    });
    
    // Weekly activity (last 7 days)
    const weeklyActivity = Array(7).fill(0);
    storeCards.forEach(card => {
      card.transactions?.forEach(t => {
        const transactionDate = new Date(t.timestamp);
        const daysAgo = Math.floor((Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) {
          weeklyActivity[6 - daysAgo] += t.points;
        }
      });
    });
    
    return {
      totalClients,
      pointsAddedToday,
      rewardsCollected,
      weeklyActivity,
    };
  }, [cards, currentUser]);

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "L";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary-light text-white p-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              {currentUser?.storeName ? (
                <span className="text-white text-2xl font-bold drop-shadow-md">
                  {getInitial(currentUser.storeName)}
                </span>
              ) : (
                <Store className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm font-medium">Painel da Loja</p>
              <h1 className="text-2xl font-bold drop-shadow-md">
                {currentUser?.storeName || "Minha Loja"}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="text-white hover:bg-white/20"
            >
              <UserCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-6 space-y-6 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Clientes</p>
            </div>
            <AnimatedCounter 
              value={storeStats.totalClients} 
              className="text-3xl font-bold text-foreground"
            />
          </Card>

          <Card className="p-4 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Hoje</p>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter 
                value={storeStats.pointsAddedToday} 
                className="text-3xl font-bold text-foreground"
              />
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
          </Card>

          <Card className="p-4 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Recompensas Coletadas</p>
            </div>
            <AnimatedCounter 
              value={storeStats.rewardsCollected} 
              className="text-3xl font-bold text-foreground"
            />
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card className="p-6 border-0 shadow-lg rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Atividade Semanal
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {storeStats.weeklyActivity.map((points, index) => {
              const maxPoints = Math.max(...storeStats.weeklyActivity, 1);
              const height = (points / maxPoints) * 100;
              const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
              const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{days[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Main Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/store-panel")}
            className="w-full h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl"
            size="lg"
          >
            <QrCode className="w-6 h-6 mr-2" />
            Adicionar Pontos (QR Code)
          </Button>

          <Button
            onClick={() => navigate("/store-clients")}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Ver Lista de Clientes
          </Button>

          <Button
            onClick={() => navigate("/store-promotions")}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl"
            size="lg"
          >
            <Megaphone className="w-5 h-5 mr-2" />
            Gerenciar Promoções
          </Button>
        </div>

        {/* Quick Tips */}
        <Card className="p-6 border-0 shadow-md rounded-3xl bg-gradient-to-br from-primary/5 to-primary-light/5">
          <h3 className="font-semibold text-foreground mb-3">💡 Dica Rápida</h3>
          <p className="text-sm text-muted-foreground">
            Use o QR Code para adicionar pontos rapidamente. Peça para o cliente mostrar 
            o código do cartão na tela do app!
          </p>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BusinessDashboard;

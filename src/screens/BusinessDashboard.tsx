import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCards } from "@/hooks/useCards";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AnimatedCounter } from "@/components/gamification/AnimatedCounter";
import { 
  Store, 
  Users, 
  TrendingUp, 
  Gift, 
  QrCode, 
  Megaphone,
  UserCircle,
  BarChart3,
  Copy,
  Check,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cards, loading: cardsLoading } = useCards();
  const { clients, loading: clientsLoading } = useFidelityCards();
  const { company, loading: companyLoading } = useCompanies();
  const [isVisible, setIsVisible] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.accountType !== 'business')) {
      navigate("/login");
      return;
    }
    if (isAuthenticated) {
      setIsVisible(true);
    }
  }, [currentUser, isAuthenticated, authLoading, navigate]);

  // Calculate store stats - now using real fidelity_cards data
  const storeStats = useMemo(() => {
    const storeName = currentUser?.storeName || "";
    const storeCards = cards.filter(c => c.storeName === storeName);
    
    // Total clients from fidelity_cards table (real data!)
    const totalClients = clients.length;
    
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
  }, [cards, currentUser, clients]);

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "L";

  const copyShareCode = () => {
    if (company?.shareCode) {
      navigator.clipboard.writeText(company.shareCode);
      setCodeCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (authLoading || cardsLoading || clientsLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Business Header */}
      <header className="gradient-glow text-white p-8 shadow-premium-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </div>
        
        <div className="container mx-auto relative">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-premium-lg">
              {currentUser?.storeName ? (
                <span className="text-white text-3xl font-bold drop-shadow-lg">
                  {getInitial(currentUser.storeName)}
                </span>
              ) : (
                <Store className="w-10 h-10" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm font-semibold mb-1">Painel da Loja</p>
              <h1 className="text-3xl font-bold drop-shadow-lg tracking-tight">
                {currentUser?.storeName || "Minha Loja"}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="text-white hover:bg-white/20 rounded-2xl w-12 h-12"
            >
              <UserCircle className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-8 space-y-6 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Share Code Card - Destaque */}
        {company && (
          <Card className="p-6 border-2 border-primary/30 shadow-premium-lg rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent fade-in relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-primary" />
                <p className="text-sm font-bold text-primary uppercase tracking-wider">Código da Loja</p>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-background/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                  <p className="text-3xl md:text-4xl font-black text-foreground tracking-[0.2em] font-mono text-center">
                    {company.shareCode}
                  </p>
                </div>
                
                <Button
                  onClick={copyShareCode}
                  className={`rounded-2xl h-16 w-16 transition-all duration-300 ${
                    codeCopied 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'gradient-glow hover:shadow-glow'
                  }`}
                >
                  {codeCopied ? (
                    <Check className="w-7 h-7 text-white" />
                  ) : (
                    <Copy className="w-7 h-7 text-white" />
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                📱 Compartilhe este código para seus clientes adicionarem sua loja no app
              </p>
            </div>
          </Card>
        )}

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-2 gap-5 fade-in">
          <Card className="p-6 border-0 shadow-premium-lg rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover-scale">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Clientes</p>
            </div>
            <AnimatedCounter 
              value={storeStats.totalClients} 
              className="text-4xl font-bold text-foreground tracking-tight"
            />
          </Card>

          <Card className="p-6 border-0 shadow-premium-lg rounded-3xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover-scale">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Hoje</p>
            </div>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter 
                value={storeStats.pointsAddedToday} 
                className="text-4xl font-bold text-foreground tracking-tight"
              />
              <span className="text-sm font-medium text-muted-foreground">pts</span>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-premium-lg rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 col-span-2 hover-scale">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Recompensas Coletadas</p>
            </div>
            <AnimatedCounter 
              value={storeStats.rewardsCollected} 
              className="text-4xl font-bold text-foreground tracking-tight"
            />
          </Card>
        </div>

        {/* Premium Weekly Activity Chart */}
        <Card className="p-8 border-0 shadow-premium-lg rounded-3xl slide-in">
          <h3 className="font-bold text-foreground mb-6 text-xl flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Atividade Semanal
          </h3>
          <div className="flex items-end justify-between h-40 gap-3">
            {storeStats.weeklyActivity.map((points, index) => {
              const maxPoints = Math.max(...storeStats.weeklyActivity, 1);
              const height = (points / maxPoints) * 100;
              const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
              const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full bg-muted/50 rounded-t-2xl relative overflow-hidden shadow-inner" style={{ height: '100%' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary via-primary-light to-primary-glow rounded-t-2xl transition-all duration-700 shadow-glow"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">{days[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Premium Main Actions */}
        <div className="space-y-4 slide-in" style={{ animationDelay: '100ms' }}>
          <Button
            onClick={() => navigate("/store-panel")}
            className="w-full h-16 text-lg rounded-3xl shadow-premium-lg hover:shadow-glow transition-all hover-scale-lg gradient-glow"
            size="lg"
          >
            <QrCode className="w-6 h-6 mr-3" />
            Adicionar Pontos (QR Code)
          </Button>

          <Button
            onClick={() => navigate("/store-clients")}
            variant="outline"
            className="w-full h-14 text-base rounded-3xl shadow-premium hover-scale"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Ver Lista de Clientes
          </Button>

          <Button
            onClick={() => navigate("/store-promotions")}
            variant="outline"
            className="w-full h-14 text-base rounded-3xl shadow-premium hover-scale"
            size="lg"
          >
            <Megaphone className="w-5 h-5 mr-2" />
            Gerenciar Promoções
          </Button>

          <Button
            onClick={() => navigate("/automatic-promotions")}
            variant="outline"
            className="w-full h-14 text-base rounded-3xl shadow-premium hover-scale bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2 text-amber-600" />
            Promoções Automáticas
          </Button>

          <Button
            onClick={() => navigate("/business-reports")}
            variant="outline"
            className="w-full h-14 text-base rounded-3xl shadow-premium hover-scale"
            size="lg"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Ver Relatórios
          </Button>
        </div>

        {/* Premium Quick Tips */}
        <Card className="p-8 border-0 shadow-premium rounded-3xl bg-gradient-to-br from-primary/5 to-primary-light/5 slide-in" style={{ animationDelay: '150ms' }}>
          <h3 className="font-bold text-foreground mb-4 text-lg">💡 Dica Rápida</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
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

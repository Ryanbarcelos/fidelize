import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useGamification } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MedalDisplay } from "@/components/MedalDisplay";
import { LogOut, MapPin, Store, Trophy, MapPinned, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { permissionGranted, requestLocationPermission } = useLocation();
  const { level, totalRewards, xpProgress, medals, unlockedMedals, nextMedal } = useGamification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 shadow-premium">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Meu Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Premium User Info Card with Level */}
        <Card className="p-8 mb-6 border-0 shadow-premium-lg rounded-3xl bg-gradient-to-br from-primary/5 to-primary-light/5 fade-in">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl gradient-glow flex items-center justify-center text-white text-3xl font-bold shadow-premium-lg">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-premium border-4 border-white dark:border-card pulse-soft">
                <span className="text-white text-sm font-bold">{level}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">{currentUser?.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{currentUser?.email}</p>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                <span className="text-base font-semibold">Nível {level}</span>
              </div>
            </div>
          </div>

          {/* Premium XP Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">
                Progresso para Nível {level + 1}
              </span>
              <span className="text-sm font-bold text-primary">
                {xpProgress.current}/{xpProgress.needed} XP
              </span>
            </div>
            <div className="relative overflow-hidden rounded-full h-4 bg-muted">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700 shadow-glow"
                style={{ width: `${xpProgress.progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {xpProgress.needed - xpProgress.current} recompensas até o próximo nível
            </p>
          </div>
        </Card>

        {/* Premium Gamification Stats */}
        <Card className="p-6 mb-6 border-0 shadow-premium-lg rounded-3xl slide-in">
          <h3 className="font-bold text-foreground mb-6 text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-3xl p-6 border border-primary/20 shadow-premium hover-scale">
              <p className="text-sm font-medium text-muted-foreground mb-2">Nível Atual</p>
              <p className="text-4xl font-bold text-foreground tracking-tight">{level}</p>
            </div>
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-3xl p-6 border border-success/20 shadow-premium hover-scale">
              <p className="text-sm font-medium text-muted-foreground mb-2">Recompensas</p>
              <p className="text-4xl font-bold text-foreground tracking-tight">{totalRewards}</p>
            </div>
          </div>
        </Card>

        {/* Premium Medals Section */}
        <Card className="p-6 mb-6 border-0 shadow-premium-lg rounded-3xl slide-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-bold text-foreground mb-6 text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Minhas Medalhas
          </h3>
          
          {nextMedal && (
            <div className="mb-6 p-5 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-3xl border border-primary/20 shadow-premium">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Próxima Medalha: {nextMedal.name}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">Progresso</span>
                  <span className="font-bold text-primary">
                    {totalRewards}/{nextMedal.requiredRewards}
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-full h-3 bg-muted">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700"
                    style={{ width: `${(totalRewards / nextMedal.requiredRewards) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <MedalDisplay 
            medals={medals} 
            unlockedMedals={unlockedMedals}
          />
          
          {unlockedMedals.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-6">
              Colete recompensas para desbloquear medalhas!
            </p>
          )}
        </Card>

        {/* Premium Modo Empresa */}
        <Card className="p-6 mb-6 border-0 shadow-premium rounded-3xl slide-in" style={{ animationDelay: '150ms' }}>
          <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Modo Empresa
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Acesse o painel da loja para escanear QR Codes de clientes e gerenciar pontos
          </p>
          <Button
            onClick={() => navigate("/store-panel")}
            variant="outline"
            className="w-full h-12 rounded-2xl hover-scale"
          >
            <Store className="w-4 h-4 mr-2" />
            Acessar Painel da Loja
          </Button>
        </Card>

        {/* Premium Location Settings */}
        <Card className="p-6 mb-6 border-0 shadow-premium rounded-3xl slide-in" style={{ animationDelay: '200ms' }}>
          <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localização
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Acesso à Localização</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {permissionGranted 
                    ? "Ativado - você pode ver lojas próximas" 
                    : "Desativado - ative para ver lojas próximas"
                  }
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${permissionGranted ? "bg-success shadow-glow" : "bg-muted"} transition-all`} />
            </div>
            {!permissionGranted && (
              <Button 
                onClick={requestLocationPermission}
                variant="outline"
                className="w-full h-12 rounded-2xl hover-scale"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Permitir Localização
              </Button>
            )}
          </div>
        </Card>

        {/* Premium Quick Actions */}
        <Card className="p-6 mb-6 border-0 shadow-premium rounded-3xl slide-in" style={{ animationDelay: '250ms' }}>
          <h3 className="font-bold text-foreground mb-5 text-lg">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl justify-start hover-scale"
              onClick={() => navigate("/achievements")}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ver Minhas Conquistas
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl justify-start hover-scale"
              onClick={() => navigate("/nearby-stores")}
            >
              <MapPinned className="w-4 h-4 mr-2" />
              Lojas Próximas
            </Button>
          </div>
        </Card>

        {/* Premium Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-14 rounded-2xl shadow-premium-lg hover:shadow-glow transition-all text-base"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;

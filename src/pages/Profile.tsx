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
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 animate-fade-in">
        {/* User Info Card with Level */}
        <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-primary/5 to-primary-light/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-xs font-bold">{level}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{currentUser?.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">{currentUser?.email}</p>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Nível {level}</span>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Progresso para Nível {level + 1}
              </span>
              <span className="text-sm font-medium text-primary">
                {xpProgress.current}/{xpProgress.needed} XP
              </span>
            </div>
            <Progress value={xpProgress.progress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {xpProgress.needed - xpProgress.current} recompensas até o próximo nível
            </p>
          </div>
        </Card>

        {/* Gamification Stats */}
        <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-2xl p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Nível Atual</p>
              <p className="text-3xl font-bold text-foreground">{level}</p>
            </div>
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-4 border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">Recompensas</p>
              <p className="text-3xl font-bold text-foreground">{totalRewards}</p>
            </div>
          </div>
        </Card>

        {/* Medals Section */}
        <Card className="p-6 mb-6 border-0 shadow-lg rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Minhas Medalhas
          </h3>
          
          {nextMedal && (
            <div className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl border border-primary/20">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Próxima Medalha: {nextMedal.name}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Progresso</span>
                  <span className="font-medium text-primary">
                    {totalRewards}/{nextMedal.requiredRewards}
                  </span>
                </div>
                <Progress 
                  value={(totalRewards / nextMedal.requiredRewards) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          )}

          <MedalDisplay 
            medals={medals} 
            unlockedMedals={unlockedMedals}
          />
          
          {unlockedMedals.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              Colete recompensas para desbloquear medalhas!
            </p>
          )}
        </Card>

        {/* Modo Empresa */}
        <Card className="p-6 mb-6 border-0 shadow-md rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Modo Empresa
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Acesse o painel da loja para escanear QR Codes de clientes e gerenciar pontos
          </p>
          <Button
            onClick={() => navigate("/store-panel")}
            variant="outline"
            className="w-full h-12 rounded-2xl"
          >
            <Store className="w-4 h-4 mr-2" />
            Acessar Painel da Loja
          </Button>
        </Card>

        {/* Location Settings */}
        <Card className="p-6 mb-6 border-0 shadow-md rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localização
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Acesso à Localização</p>
                <p className="text-sm text-muted-foreground">
                  {permissionGranted 
                    ? "Ativado - você pode ver lojas próximas" 
                    : "Desativado - ative para ver lojas próximas"
                  }
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${permissionGranted ? "bg-success" : "bg-muted"}`} />
            </div>
            {!permissionGranted && (
              <Button 
                onClick={requestLocationPermission}
                variant="outline"
                className="w-full h-12 rounded-2xl"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Permitir Localização
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mb-6 border-0 shadow-md rounded-3xl">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl justify-start"
              onClick={() => navigate("/achievements")}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ver Minhas Conquistas
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl justify-start"
              onClick={() => navigate("/nearby-stores")}
            >
              <MapPinned className="w-4 h-4 mr-2" />
              Lojas Próximas
            </Button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-14 rounded-2xl shadow-lg"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;

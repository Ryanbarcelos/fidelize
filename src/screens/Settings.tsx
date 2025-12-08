import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  MapPin,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { currentUser, user } = useAuth();
  const { permissionGranted, requestLocationPermission } = useLocation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  
  // Notification preferences
  const [notifyPromotions, setNotifyPromotions] = useState(true);
  const [notifyRewards, setNotifyRewards] = useState(true);
  const [notifyPoints, setNotifyPoints] = useState(true);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setNotifyPromotions(data.notify_promotions);
          setNotifyRewards(data.notify_rewards);
          setNotifyPoints(data.notify_points);
        } else {
          // Create default preferences if not exists
          await supabase.from("user_preferences").insert({
            user_id: user.id,
            notify_promotions: true,
            notify_rewards: true,
            notify_points: true,
          });
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Save notification preference when changed
  const updateNotificationPreference = async (
    field: 'notify_promotions' | 'notify_rewards' | 'notify_points',
    value: boolean
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({ [field]: value })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Preferência salva!");
    } catch (error: any) {
      toast.error("Erro ao salvar preferência");
      console.error("Error saving preference:", error);
    }
  };

  const handleNotifyPromotionsChange = (value: boolean) => {
    setNotifyPromotions(value);
    updateNotificationPreference('notify_promotions', value);
  };

  const handleNotifyRewardsChange = (value: boolean) => {
    setNotifyRewards(value);
    updateNotificationPreference('notify_rewards', value);
  };

  const handleNotifyPointsChange = (value: boolean) => {
    setNotifyPoints(value);
    updateNotificationPreference('notify_points', value);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil: " + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao alterar senha: " + error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 shadow-premium">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Profile Settings */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações do Perfil
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="rounded-xl bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full h-12 rounded-2xl"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingProfile ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </Card>

        {/* Password Settings */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Alterar Senha
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              <Shield className="w-4 h-4 mr-2" />
              {savingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificações
          </h2>
          
          {loadingPreferences ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Promoções</p>
                  <p className="text-sm text-muted-foreground">Receber notificações de novas promoções</p>
                </div>
                <Switch
                  checked={notifyPromotions}
                  onCheckedChange={handleNotifyPromotionsChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Recompensas</p>
                  <p className="text-sm text-muted-foreground">Avisar quando ganhar recompensas</p>
                </div>
                <Switch
                  checked={notifyRewards}
                  onCheckedChange={handleNotifyRewardsChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Pontos</p>
                  <p className="text-sm text-muted-foreground">Notificar ao receber pontos</p>
                </div>
                <Switch
                  checked={notifyPoints}
                  onCheckedChange={handleNotifyPointsChange}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Location Settings */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localização
          </h2>
          
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

        {/* Theme Settings */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Aparência
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl"
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Claro</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl"
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs">Escuro</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl"
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs">Sistema</span>
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6 border-0 shadow-premium rounded-3xl">
          <h2 className="font-bold text-foreground mb-6 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Sobre o App
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Conta</span>
              <span className="font-medium text-foreground capitalize">
                {currentUser?.accountType === 'business' ? 'Empresa' : 'Cliente'}
              </span>
            </div>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;

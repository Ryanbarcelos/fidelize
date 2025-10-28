import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, MapPin, Award, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { permissionGranted, requestLocationPermission } = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <UserCircle className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Perfil</h1>
              <p className="text-sm text-white/90">
                Gerencie suas preferências
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{currentUser?.email || 'Usuário'}</p>
                <p className="text-sm text-muted-foreground">Membro desde 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Panel Card */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Store className="w-5 h-5" />
              Modo Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acesse o painel da loja para escanear QR Codes de clientes e gerenciar pontos
            </p>
            <Button
              onClick={() => navigate('/store-panel')}
              variant="outline"
              className="w-full"
            >
              <Store className="w-4 h-4 mr-2" />
              Acessar Painel da Loja
            </Button>
          </CardContent>
        </Card>

        {/* Location Settings Card */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Acesso à Localização</p>
                <p className="text-sm text-muted-foreground">
                  {permissionGranted 
                    ? 'Ativado - você pode ver lojas próximas' 
                    : 'Desativado - ative para ver lojas próximas'
                  }
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${permissionGranted ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            {!permissionGranted && (
              <Button 
                onClick={requestLocationPermission}
                variant="outline"
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Permitir Localização
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/achievements')}
            >
              <Award className="w-4 h-4 mr-2" />
              Ver Minhas Conquistas
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/nearby-stores')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Lojas Próximas
            </Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}

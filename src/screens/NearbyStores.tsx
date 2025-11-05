import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { NearbyStoreCard } from '@/components/common/NearbyStoreCard';
import { useLocation } from '@/hooks/useLocation';
import { MOCK_STORES } from '@/types/store';
import { StoreWithDistance } from '@/types/store';

export default function NearbyStores() {
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    error,
    loading,
    permissionGranted,
    requestLocationPermission,
    calculateDistance,
  } = useLocation();

  const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);

  useEffect(() => {
    if (latitude && longitude) {
      const storesWithDistance = MOCK_STORES.map(store => ({
        ...store,
        distance: calculateDistance(latitude, longitude, store.latitude, store.longitude),
      })).sort((a, b) => a.distance - b.distance);
      
      setNearbyStores(storesWithDistance);
    }
  }, [latitude, longitude]);

  const handleAddCard = (storeName: string) => {
    navigate('/add-card', { state: { storeName } });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Lojas Próximas</h1>
              <p className="text-sm text-white/90">
                Encontre estabelecimentos parceiros perto de você
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Permission Request */}
        {!permissionGranted && !error && (
          <Alert className="bg-card border-primary/20">
            <MapPin className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2">
              <p className="font-medium mb-2 text-foreground">
                Permitir que o Fidelize acesse sua localização?
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Isso nos ajuda a mostrar lojas próximas de você.
              </p>
              <Button onClick={requestLocationPermission} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Permitir Localização
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <p className="font-medium mb-2">{error}</p>
              <p className="text-sm mb-3">
                Ative a localização para ver lojas próximas.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestLocationPermission}
                className="bg-background"
              >
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Obtendo sua localização...</p>
          </div>
        )}

        {/* Stores List */}
        {permissionGranted && !loading && nearbyStores.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {nearbyStores.length} lojas encontradas
              </h2>
            </div>
            
            {nearbyStores.map(store => (
              <NearbyStoreCard
                key={store.id}
                store={store}
                onAddCard={handleAddCard}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {permissionGranted && !loading && nearbyStores.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma loja encontrada nas proximidades.
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

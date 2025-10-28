import { MapPin, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoreWithDistance } from '@/types/store';

interface NearbyStoreCardProps {
  store: StoreWithDistance;
  onAddCard: (storeName: string) => void;
}

export function NearbyStoreCard({ store, onAddCard }: NearbyStoreCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Cafeteria: 'bg-amber-500',
      Presentes: 'bg-pink-500',
      Restaurante: 'bg-orange-500',
      Farmácia: 'bg-green-500',
      Padaria: 'bg-yellow-500',
    };
    return colors[category] || 'bg-primary';
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 slide-up bg-card">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full ${getCategoryColor(store.category)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
          {store.name.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {store.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {store.category}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-primary font-medium">
              {store.distance < 1 
                ? `${Math.round(store.distance * 1000)}m de você`
                : `${store.distance.toFixed(1)}km de você`
              }
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {store.address}
          </p>
        </div>

        <Button
          onClick={() => onAddCard(store.name)}
          size="sm"
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </Card>
  );
}

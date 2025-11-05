import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { LoyaltyCard } from "@/types/card";
import { useAuth } from "@/hooks/useAuth";

interface QRCodeDisplayProps {
  open: boolean;
  onClose: () => void;
  card: LoyaltyCard;
}

export const QRCodeDisplay = ({ open, onClose, card }: QRCodeDisplayProps) => {
  const { currentUser } = useAuth();
  
  const qrData = JSON.stringify({
    cardId: card.id,
    storeName: card.storeName,
    userName: currentUser?.name || "Cliente",
    storePin: card.storePin,
    points: card.points
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-0 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">QR Code do Cartão</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 px-4 animate-scale-in">
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
            <QRCode 
              value={qrData} 
              size={220}
              level="H"
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-bold text-lg text-foreground">{card.storeName}</h3>
            <p className="text-sm text-muted-foreground">
              Mostre este código para a loja adicionar pontos
            </p>
            <div className="bg-secondary/20 rounded-xl px-4 py-2 mt-4">
              <p className="text-sm font-medium text-foreground">
                {card.points} {card.points === 1 ? "ponto" : "pontos"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

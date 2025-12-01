import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { LoyaltyCard } from "@/types/card";
import { useTransactionToken } from "@/hooks/useTransactionToken";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TemporaryQRCodeProps {
  open: boolean;
  onClose: () => void;
  card: LoyaltyCard;
  actionType: 'add_points' | 'collect_reward';
}

export const TemporaryQRCode = ({ open, onClose, card, actionType }: TemporaryQRCodeProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const { generateToken, loading } = useTransactionToken();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      generateNewToken();
    } else {
      setToken(null);
      setTimeLeft(30);
    }
  }, [open]);

  useEffect(() => {
    if (!token || !open) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Token expirado, gerar novo
          generateNewToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token, open]);

  const generateNewToken = async () => {
    const result = await generateToken(card.id, actionType);
    
    if (result.success && result.token) {
      setToken(result.token.token);
      setTimeLeft(30);
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
      onClose();
    }
  };

  const actionLabel = actionType === 'add_points' ? 'adicionar pontos' : 'coletar recompensa';
  const progressValue = (timeLeft / 30) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-0 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">QR Code Temporário</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 animate-scale-in">
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
              {token && (
                <QRCode 
                  value={token} 
                  size={220}
                  level="H"
                />
              )}
            </div>
            
            <div className="text-center space-y-3 w-full">
              <h3 className="font-bold text-lg text-foreground">{card.storeName}</h3>
              
              <div className="bg-secondary/20 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Mostre este código para {actionLabel}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expira em:</span>
                  <span className="font-bold text-foreground">{timeLeft}s</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                ⚠️ Este código é válido por apenas 30 segundos e pode ser usado uma única vez
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

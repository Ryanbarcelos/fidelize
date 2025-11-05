import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";

interface CelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  storeName: string;
  type: "complete" | "reward";
}

export const CelebrationDialog = ({ open, onClose, storeName, type }: CelebrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-0 shadow-premium-lg max-w-sm bounce-in">
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-28 h-28 rounded-full bg-primary blur-xl" />
            </div>
            <div className="relative w-28 h-28 rounded-full gradient-glow flex items-center justify-center shadow-premium-lg animate-bounce">
              {type === "complete" ? (
                <Sparkles className="w-14 h-14 text-white drop-shadow-lg" />
              ) : (
                <Gift className="w-14 h-14 text-white drop-shadow-lg" />
              )}
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent tracking-tight">
            Parabéns! 🎉
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-10 leading-relaxed">
            {type === "complete" 
              ? `Você completou seu cartão da ${storeName}! Já pode coletar seu prêmio na loja 🎁`
              : `Recompensa da ${storeName} coletada com sucesso!`
            }
          </p>

          <Button 
            onClick={onClose} 
            className="w-full h-14 rounded-3xl shadow-premium-lg hover:shadow-glow text-lg font-semibold hover-scale"
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

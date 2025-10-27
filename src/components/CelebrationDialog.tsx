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
      <DialogContent className="rounded-3xl border-0 shadow-2xl max-w-sm">
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping opacity-30">
              <div className="w-24 h-24 rounded-full bg-primary" />
            </div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl animate-bounce">
              {type === "complete" ? (
                <Sparkles className="w-12 h-12 text-white" />
              ) : (
                <Gift className="w-12 h-12 text-white" />
              )}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Parabéns! 🎉
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-8">
            {type === "complete" 
              ? `Você completou seu cartão da ${storeName}! Já pode coletar seu prêmio na loja 🎁`
              : `Recompensa da ${storeName} coletada com sucesso!`
            }
          </p>

          <Button 
            onClick={onClose} 
            className="w-full h-12 rounded-2xl shadow-lg text-lg"
          >
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFidelityCards } from "@/hooks/useFidelityCards";

interface AddStoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddStoreModal({ open, onOpenChange, onSuccess }: AddStoreModalProps) {
  const [shareCode, setShareCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addStoreByCode } = useFidelityCards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shareCode.trim()) {
      toast.error("Digite o código da loja");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await addStoreByCode(shareCode.trim());
      
      if (result.success) {
        toast.success("Loja adicionada com sucesso!");
        setShareCode("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao adicionar loja");
      }
    } catch (error) {
      toast.error("Erro ao adicionar loja");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShareCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Adicionar Loja</DialogTitle>
          <DialogDescription className="text-center">
            Digite o código da loja para vincular seu cartão de fidelidade
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="shareCode">Código da Loja</Label>
            <Input
              id="shareCode"
              placeholder="Ex: TCC2024"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-semibold tracking-wider h-14 rounded-2xl"
              autoComplete="off"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-center">
              Peça o código para o estabelecimento
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-2xl"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-2xl"
              disabled={isLoading || !shareCode.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

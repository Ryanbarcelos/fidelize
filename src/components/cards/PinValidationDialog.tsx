import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

// Schema de validação para o PIN
const pinSchema = z.object({
  pin: z
    .string()
    .trim()
    .min(4, { message: "PIN deve ter no mínimo 4 dígitos" })
    .max(6, { message: "PIN deve ter no máximo 6 dígitos" })
    .regex(/^\d+$/, { message: "PIN deve conter apenas números" }),
});

interface PinValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: (pin: string) => Promise<boolean>;
  title: string;
  description: string;
  actionLabel?: string;
}

export const PinValidationDialog = ({
  open,
  onOpenChange,
  onValidate,
  title,
  description,
  actionLabel = "Confirmar",
}: PinValidationDialogProps) => {
  const [pin, setPin] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação client-side com zod
    const validation = pinSchema.safeParse({ pin });
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "PIN inválido";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsValidating(true);

    try {
      const isValid = await onValidate(pin);
      
      if (isValid) {
        setPin("");
        setError(null);
        onOpenChange(false);
      } else {
        setError("PIN incorreto");
        toast.error("PIN incorreto. Tente novamente.");
        setPin(""); // Limpa o campo em caso de erro
      }
    } catch (error) {
      console.error("Erro ao validar PIN:", error);
      setError("Erro ao validar PIN");
      toast.error("Erro ao validar PIN. Tente novamente.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setPin("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN da Loja</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  // Remove caracteres não-numéricos
                  const numericValue = e.target.value.replace(/\D/g, "");
                  setPin(numericValue);
                  setError(null);
                }}
                placeholder="Digite o PIN"
                className={error ? "border-destructive" : ""}
                disabled={isValidating}
                autoFocus
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Digite o PIN de 4-6 dígitos fornecido pela loja
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isValidating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isValidating || !pin}>
              {isValidating ? "Validando..." : actionLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

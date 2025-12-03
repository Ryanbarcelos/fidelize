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
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

interface CompanyPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
}

export function CompanyPinDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
  title = "Validação de PIN",
  description = "Digite o PIN de 4 dígitos da loja para continuar.",
  actionLabel = "Confirmar",
}: CompanyPinDialogProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { validateCompanyPin } = useCompanies();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pin || pin.length < 4) {
      setError("Digite um PIN válido de 4 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await validateCompanyPin(companyId, pin);

      if (isValid) {
        setPin("");
        onOpenChange(false);
        onSuccess();
      } else {
        setError("PIN incorreto. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao validar PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onOpenChange(false);
  };

  const handlePinChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setPin(numericValue);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN da Loja</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              className="text-center text-2xl font-bold tracking-[0.5em] h-14 rounded-2xl"
              maxLength={4}
              autoComplete="off"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

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
              disabled={isLoading || pin.length < 4}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

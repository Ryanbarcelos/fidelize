import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCards } from "@/hooks/useCards";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QRScanner } from "@/components/cards/QRScanner";
import { PinValidationDialog } from "@/components/cards/PinValidationDialog";
import { ArrowLeft, QrCode, History } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";
import { PinService } from "@/services/pinService";

const StorePanel = () => {
  const navigate = useNavigate();
  const { cards, updateCard, addTransaction } = useCards();
  const { user } = useAuth();
  const { logAction, getLocation } = useAuditLog();

  const [showScanner, setShowScanner] = useState(false);
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pointsInput, setPointsInput] = useState("");

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleScan = async (data: string) => {
    setShowScanner(false);
    
    const location = await getLocation();
    const card = cards.find((c) => c.id === data);
    
    if (!card) {
      await logAction({
        cardId: data,
        action: 'scan_qr_code',
        status: 'failed',
        errorMessage: 'Cartão não encontrado',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error("Cartão não encontrado");
      return;
    }

    if (card.storeName !== user?.user_metadata?.store_name) {
      await logAction({
        cardId: card.id,
        action: 'scan_qr_code',
        status: 'failed',
        errorMessage: 'Cartão não pertence a esta loja',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error("Este cartão não pertence à sua loja");
      return;
    }

    await logAction({
      cardId: card.id,
      action: 'scan_qr_code',
      status: 'success',
      latitude: location?.latitude,
      longitude: location?.longitude,
    });

    setScannedCardId(data);
    setShowPinDialog(true);
  };

  const handleValidatePin = async (pin: string): Promise<boolean> => {
    if (!scannedCardId) {
      toast.error("Erro: cartão não identificado");
      return false;
    }

    const location = await getLocation();
    const card = cards.find((c) => c.id === scannedCardId);
    
    if (!card) {
      await logAction({
        cardId: scannedCardId,
        action: 'validate_pin',
        status: 'failed',
        errorMessage: 'Cartão não encontrado',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error("Cartão não encontrado");
      return false;
    }

    // Validar PIN usando o serviço
    const validation = PinService.validateForAddPoints(pin, card.storePin);
    
    if (!validation.valid) {
      await logAction({
        cardId: card.id,
        action: 'add_points',
        status: 'failed',
        errorMessage: validation.error,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error(validation.error);
      return false;
    }

    // Adicionar pontos
    const pointsToAdd = parseInt(pointsInput) || 1;
    const newPoints = card.points + pointsToAdd;
    
    const result = await updateCard(card.id, { points: newPoints });
    
    if (result?.success) {
      await addTransaction(card.id, "points_added", pointsToAdd, card.storeName, card.userName);
      
      await logAction({
        cardId: card.id,
        action: 'add_points',
        status: 'success',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.success(`${pointsToAdd} ponto${pointsToAdd > 1 ? "s" : ""} adicionado${pointsToAdd > 1 ? "s" : ""} com sucesso!`);
      setPointsInput("");
      
      if (newPoints >= 10 && card.points < 10) {
        triggerConfetti();
        toast.success("🎉 Cliente completou o cartão!");
      }
    } else {
      await logAction({
        cardId: card.id,
        action: 'add_points',
        status: 'failed',
        errorMessage: result?.error,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error(result?.error || "Erro ao adicionar pontos");
      return false;
    }

    setScannedCardId(null);
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Painel da Loja</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Info Card */}
        <Card className="p-6 mb-6 border-0 shadow-md">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Bem-vindo{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}
          </h2>
          <p className="text-muted-foreground mb-4">
            Escaneie o QR Code do cliente para adicionar pontos de forma segura com validação por PIN.
          </p>
          
          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor="points" className="text-sm font-medium">
              Quantidade de pontos a adicionar
            </Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
              placeholder="1"
              className="h-12"
            />
          </div>
        </Card>

        {/* Scan Button */}
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl mb-4"
          size="lg"
        >
          <QrCode className="w-6 h-6 mr-2" />
          Escanear QR Code
        </Button>

        {/* History Button */}
        <Button
          onClick={() => navigate("/business-dashboard")}
          variant="outline"
          className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg"
          size="lg"
        >
          <History className="w-5 h-5 mr-2" />
          Ver histórico e estatísticas
        </Button>

        {/* Instructions */}
        <Card className="p-6 border-0 shadow-md mt-6">
          <h3 className="font-semibold text-foreground mb-4">Como funciona?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                1
              </span>
              <span>Defina quantos pontos deseja adicionar no campo acima</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                2
              </span>
              <span>Cliente mostra o QR Code do cartão de fidelidade</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                3
              </span>
              <span>Clique em "Escanear QR Code" e aponte a câmera</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                4
              </span>
              <span>Digite o PIN da sua loja para confirmar</span>
            </li>
          </ol>
        </Card>
      </main>

      {/* QR Scanner */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* PIN Validation Dialog */}
      <PinValidationDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onValidate={handleValidatePin}
        title="Validar PIN para Adicionar Pontos"
        description="Digite o PIN de 4 dígitos da loja para confirmar a adição de pontos."
        actionLabel="Adicionar Pontos"
      />
    </div>
  );
};

export default StorePanel;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCards } from "@/hooks/useCards";
import { useTransactionToken } from "@/hooks/useTransactionToken";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, QrCode, Plus, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { QRScanner } from "@/components/cards/QRScanner";
import { PinValidationDialog } from "@/components/cards/PinValidationDialog";

const StorePanel = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addTransaction, cards, refetch } = useCards();
  const { validateToken, markTokenAsUsed } = useTransactionToken();
  const { logAction, getLocation } = useAuditLog();

  const [showScanner, setShowScanner] = useState(false);
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState("");

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

  const handleQRScan = async (data: string) => {
    const location = await getLocation();
    
    // O data agora é simplesmente o token temporário
    const result = await validateToken(data);

    if (!result.success || !result.tokenData) {
      await logAction({
        action: 'scan_qr',
        status: 'failed',
        errorMessage: result.error,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      toast.error(result.error || "Token inválido ou expirado");
      setShowScanner(false);
      return;
    }

    await logAction({
      cardId: result.tokenData.cardId,
      action: 'scan_qr',
      status: 'success',
      latitude: location?.latitude,
      longitude: location?.longitude,
    });

    setScannedToken(data);
    setTokenData(result.tokenData);
    setShowScanner(false);
    
    // Se for adicionar pontos, mostrar dialog para quantidade
    if (result.tokenData.actionType === 'add_points') {
      // Pode mostrar dialog para quantidade, mas vou simplificar e pedir PIN direto
      setShowPinDialog(true);
    } else {
      // Se for coletar recompensa, pedir PIN direto
      setShowPinDialog(true);
    }
  };

  const handlePinValidation = async (pin: string): Promise<boolean> => {
    if (!tokenData || !scannedToken) return false;

    const location = await getLocation();

    // Buscar o cartão para validar o PIN
    const card = cards.find((c) => c.id === tokenData.cardId);
    
    if (!card) {
      await logAction({
        cardId: tokenData.cardId,
        action: `${tokenData.actionType}_pin_validation`,
        status: 'failed',
        errorMessage: 'Cartão não encontrado',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      toast.error("Cartão não encontrado");
      return false;
    }

    // Validar PIN
    if (pin !== card.storePin) {
      await logAction({
        cardId: card.id,
        action: `${tokenData.actionType}_pin_validation`,
        status: 'failed',
        errorMessage: 'PIN incorreto',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      return false;
    }

    // PIN válido, processar ação
    try {
      if (tokenData.actionType === 'add_points') {
        const points = parseInt(pointsToAdd) || 1;
        if (points <= 0) {
          toast.error("Por favor, insira uma quantidade válida de pontos");
          return false;
        }

        const result = await addTransaction(
          card.id,
          "points_added",
          points,
          card.storeName,
          card.userName
        );

        if (result.success) {
          await markTokenAsUsed(tokenData.id);
          
          await logAction({
            cardId: card.id,
            action: 'add_points',
            status: 'success',
            latitude: location?.latitude,
            longitude: location?.longitude,
          });

          triggerConfetti();
          toast.success(`${points} ${points === 1 ? "ponto adicionado" : "pontos adicionados"} com sucesso!`);
          await refetch();
          resetDialog();
          return true;
        } else {
          await logAction({
            cardId: card.id,
            action: 'add_points',
            status: 'failed',
            errorMessage: result.error,
            latitude: location?.latitude,
            longitude: location?.longitude,
          });

          toast.error(result.error || "Erro ao adicionar pontos");
          return false;
        }
      } else if (tokenData.actionType === 'collect_reward') {
        if (card.points < 10) {
          await logAction({
            cardId: card.id,
            action: 'collect_reward',
            status: 'failed',
            errorMessage: 'Pontos insuficientes',
            latitude: location?.latitude,
            longitude: location?.longitude,
          });

          toast.error("Este cartão ainda não tem 10 pontos para validar a recompensa");
          return false;
        }

        const result = await addTransaction(
          card.id,
          "reward_collected",
          10,
          card.storeName,
          card.userName
        );

        if (result.success) {
          await markTokenAsUsed(tokenData.id);
          
          await logAction({
            cardId: card.id,
            action: 'collect_reward',
            status: 'success',
            latitude: location?.latitude,
            longitude: location?.longitude,
          });

          triggerConfetti();
          toast.success("Parabéns! Recompensa confirmada e cartão reiniciado.");
          await refetch();
          resetDialog();
          return true;
        } else {
          await logAction({
            cardId: card.id,
            action: 'collect_reward',
            status: 'failed',
            errorMessage: result.error,
            latitude: location?.latitude,
            longitude: location?.longitude,
          });

          toast.error(result.error || "Erro ao validar recompensa");
          return false;
        }
      }
    } catch (error: any) {
      await logAction({
        cardId: card.id,
        action: tokenData.actionType,
        status: 'failed',
        errorMessage: error.message,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      toast.error("Erro ao processar operação");
      return false;
    }

    return false;
  };

  const resetDialog = () => {
    setScannedToken(null);
    setTokenData(null);
    setShowPinDialog(false);
    setPointsToAdd("");
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
            Bem-vindo{currentUser?.name ? `, ${currentUser.name}` : ""}
          </h2>
          <p className="text-muted-foreground">
            Escaneie o QR Code temporário do cliente para adicionar pontos ou validar recompensas de forma rápida e segura.
          </p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">
              🔒 Sistema de Segurança Ativado
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              QR codes temporários com validade de 30 segundos e log de auditoria completo
            </p>
          </div>
        </Card>

        {/* Scan Button */}
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl mb-6"
          size="lg"
        >
          <QrCode className="w-6 h-6 mr-2" />
          Escanear QR Code Temporário
        </Button>

        {/* Instructions */}
        <Card className="p-6 border-0 shadow-md">
          <h3 className="font-semibold text-foreground mb-4">Como funciona?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                1
              </span>
              <span>Cliente gera QR Code temporário no app (válido por 30 segundos)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                2
              </span>
              <span>Clique em "Escanear QR Code Temporário" e aponte a câmera para o código</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                3
              </span>
              <span>Digite o PIN da sua loja para confirmar a operação</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                4
              </span>
              <span>Pronto! Todas as ações são registradas no log de auditoria</span>
            </li>
          </ol>
        </Card>
      </main>

      {/* QR Scanner */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Points Input Dialog (apenas para add_points) */}
      {tokenData?.actionType === 'add_points' && showPinDialog && (
        <Dialog open={true} onOpenChange={(open) => !open && resetDialog()}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Quantidade de Pontos</DialogTitle>
              <DialogDescription>
                Digite quantos pontos deseja adicionar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pointsAmount" className="text-base">Quantidade de pontos</Label>
                <Input
                  id="pointsAmount"
                  type="number"
                  min="1"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  placeholder="Ex: 1"
                  className="h-14 text-lg rounded-2xl"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={resetDialog}
                className="rounded-2xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (!pointsToAdd || parseInt(pointsToAdd) <= 0) {
                    toast.error("Digite uma quantidade válida");
                    return;
                  }
                  // Continuar para validação de PIN
                }} 
                className="rounded-2xl"
              >
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* PIN Validation Dialog */}
      <PinValidationDialog
        open={showPinDialog && (tokenData?.actionType === 'collect_reward' || (tokenData?.actionType === 'add_points' && pointsToAdd !== ''))}
        onOpenChange={setShowPinDialog}
        onValidate={handlePinValidation}
        title={tokenData?.actionType === 'add_points' ? 'Validar PIN para Adicionar Pontos' : 'Validar PIN para Coletar Recompensa'}
        description="Digite o PIN de 4-6 dígitos fornecido pela loja para confirmar a operação."
        actionLabel={tokenData?.actionType === 'add_points' ? 'Adicionar Pontos' : 'Coletar Recompensa'}
      />
    </div>
  );
};

export default StorePanel;

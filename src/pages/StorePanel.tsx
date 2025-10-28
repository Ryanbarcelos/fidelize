import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
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
import { ArrowLeft, QrCode, Plus, Gift } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { QRScanner } from "@/components/QRScanner";

interface ScannedData {
  cardId: string;
  storeName: string;
  userName: string;
  storePin: string;
  points: number;
}

const StorePanel = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [actionType, setActionType] = useState<"add" | "collect" | null>(null);
  const [pinInput, setPinInput] = useState("");
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

  const handleQRScan = (data: string) => {
    try {
      const parsed: ScannedData = JSON.parse(data);
      
      // Find the card in local storage
      const card = cards.find((c) => c.id === parsed.cardId);
      
      if (!card) {
        toast.error("Cartão não encontrado no sistema");
        setShowScanner(false);
        return;
      }

      setScannedData(parsed);
      setShowScanner(false);
      setActionType(null);
    } catch (error) {
      toast.error("QR Code inválido");
      setShowScanner(false);
    }
  };

  const handleAddPoints = () => {
    if (!scannedData) return;

    if (pinInput !== scannedData.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    const points = parseInt(pointsToAdd) || 0;
    if (points <= 0) {
      toast.error("Por favor, insira uma quantidade válida de pontos");
      return;
    }

    const card = cards.find((c) => c.id === scannedData.cardId);
    if (!card) {
      toast.error("Cartão não encontrado");
      return;
    }

    const newPoints = card.points + points;
    const updatedCards = cards.map((c) =>
      c.id === scannedData.cardId
        ? { ...c, points: newPoints, updatedAt: new Date().toISOString() }
        : c
    );
    setCards(updatedCards);

    triggerConfetti();
    toast.success(`${points} ${points === 1 ? "ponto adicionado" : "pontos adicionados"} com sucesso!`);

    // Check if card is complete
    if (newPoints >= 10 && card.points < 10) {
      setTimeout(() => {
        toast.success(`🎉 Cartão de ${scannedData.userName} completado! Recompensa disponível!`);
      }, 500);
    }

    resetDialog();
  };

  const handleCollectReward = () => {
    if (!scannedData) return;

    if (pinInput !== scannedData.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    const card = cards.find((c) => c.id === scannedData.cardId);
    if (!card) {
      toast.error("Cartão não encontrado");
      return;
    }

    if (card.points < 10) {
      toast.error("Este cartão ainda não tem 10 pontos para validar a recompensa");
      return;
    }

    const updatedCards = cards.map((c) =>
      c.id === scannedData.cardId
        ? { ...c, points: 0, updatedAt: new Date().toISOString() }
        : c
    );
    setCards(updatedCards);

    triggerConfetti();
    toast.success("Parabéns! Recompensa confirmada e cartão reiniciado.");

    resetDialog();
  };

  const resetDialog = () => {
    setScannedData(null);
    setActionType(null);
    setPinInput("");
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
          <h2 className="text-xl font-bold text-foreground mb-2">Bem-vindo ao Modo Empresa</h2>
          <p className="text-muted-foreground">
            Escaneie o QR Code do cliente para adicionar pontos ou validar recompensas de forma rápida e segura.
          </p>
        </Card>

        {/* Scan Button */}
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl mb-6"
          size="lg"
        >
          <QrCode className="w-6 h-6 mr-2" />
          Escanear QR Code
        </Button>

        {/* Instructions */}
        <Card className="p-6 border-0 shadow-md">
          <h3 className="font-semibold text-foreground mb-4">Como funciona?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                1
              </span>
              <span>Clique em "Escanear QR Code" e aponte a câmera para o código do cliente</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                2
              </span>
              <span>Escolha se deseja adicionar pontos ou validar recompensa</span>
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
              <span>Pronto! Os pontos serão atualizados automaticamente</span>
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

      {/* Action Selection Dialog */}
      <Dialog open={scannedData !== null && actionType === null} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">QR Code Lido</DialogTitle>
            <DialogDescription>
              Cliente: <span className="font-semibold">{scannedData?.userName}</span>
              <br />
              Loja: <span className="font-semibold">{scannedData?.storeName}</span>
              <br />
              Pontos atuais: <span className="font-semibold">{scannedData?.points}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              onClick={() => setActionType("add")}
              className="w-full h-14 text-lg rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Pontos
            </Button>
            {scannedData && scannedData.points >= 10 && (
              <Button
                onClick={() => setActionType("collect")}
                className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-success to-success/80"
              >
                <Gift className="w-5 h-5 mr-2" />
                Validar Recompensa
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog open={actionType === "add"} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Adicionar Pontos</DialogTitle>
            <DialogDescription>
              Digite o PIN da loja e a quantidade de pontos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-base">PIN da Loja</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="h-14 text-lg text-center tracking-widest rounded-2xl"
              />
            </div>
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
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setPinInput("");
                setPointsToAdd("");
              }}
              className="rounded-2xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPoints} className="rounded-2xl">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collect Reward Dialog */}
      <Dialog open={actionType === "collect"} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Validar Recompensa</DialogTitle>
            <DialogDescription>
              Digite o PIN da loja para validar a recompensa e reiniciar o cartão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collectPin" className="text-base">PIN da Loja</Label>
              <Input
                id="collectPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="h-14 text-lg text-center tracking-widest rounded-2xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setPinInput("");
              }}
              className="rounded-2xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleCollectReward} className="rounded-2xl">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorePanel;

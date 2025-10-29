import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAchievements } from "@/hooks/useAchievements";
import { LoyaltyCard } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Plus, Gift, QrCode, History } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { CelebrationDialog } from "@/components/CelebrationDialog";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

const CardDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cards, setCards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const { updateAchievements, incrementRewardsCollected } = useAchievements();
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [isCollectRewardOpen, setIsCollectRewardOpen] = useState(false);
  const [celebrationDialog, setCelebrationDialog] = useState<{ open: boolean; type: "complete" | "reward" | null }>({ 
    open: false, 
    type: null 
  });
  const [pinInput, setPinInput] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [collectPinInput, setCollectPinInput] = useState("");
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);

  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    if (card) {
      setAnimatedPoints(card.points);
    }
  }, [card]);

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Cartão não encontrado</h2>
          <Button onClick={() => navigate("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setCards(cards.filter((c) => c.id !== id));
    toast.success("Cartão excluído com sucesso!");
    navigate("/");
  };

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

  const handleAddPoints = () => {
    if (!card) return;

    if (pinInput !== card.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    const points = parseInt(pointsToAdd) || 0;
    if (points <= 0) {
      toast.error("Por favor, insira uma quantidade válida de pontos");
      return;
    }

    const newPoints = card.points + points;
    
    // Create transaction record
    const newTransaction = {
      id: Date.now().toString(),
      cardId: card.id,
      type: "points_added" as const,
      points: points,
      storeName: card.storeName,
      timestamp: new Date().toISOString(),
    };
    
    const updatedCards = cards.map((c) =>
      c.id === id
        ? { 
            ...c, 
            points: newPoints, 
            updatedAt: new Date().toISOString(),
            transactions: [...(c.transactions || []), newTransaction]
          }
        : c
    );
    setCards(updatedCards);
    
    // Trigger confetti animation
    triggerConfetti();
    
    // Success toast
    toast.success(`${points} ${points === 1 ? "ponto adicionado" : "pontos adicionados"} com sucesso!`);
    
    // Check if card is complete (10 points)
    if (newPoints >= 10 && card.points < 10) {
      setTimeout(() => {
        setCelebrationDialog({ open: true, type: "complete" });
      }, 500);
    }
    
    setIsAddPointsOpen(false);
    setPinInput("");
    setPointsToAdd("");
    
    // Update achievements
    updateAchievements();
  };

  const handleCollectReward = () => {
    if (!card) return;

    if (collectPinInput !== card.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    if (card.points < 10) {
      toast.error("Você precisa de pelo menos 10 pontos para coletar a recompensa");
      return;
    }

    // Create transaction record
    const newTransaction = {
      id: Date.now().toString(),
      cardId: card.id,
      type: "reward_collected" as const,
      points: 10,
      storeName: card.storeName,
      timestamp: new Date().toISOString(),
    };

    const updatedCards = cards.map((c) =>
      c.id === id
        ? { 
            ...c, 
            points: 0, 
            updatedAt: new Date().toISOString(),
            transactions: [...(c.transactions || []), newTransaction]
          }
        : c
    );
    setCards(updatedCards);
    
    // Trigger confetti animation
    triggerConfetti();
    
    // Show celebration dialog
    setCelebrationDialog({ open: true, type: "reward" });
    
    // Increment rewards collected achievement
    incrementRewardsCollected();
    
    setIsCollectRewardOpen(false);
    setCollectPinInput("");
  };

  const cardColors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-red-500 to-red-600",
  ];
  
  const colorIndex = card.id.charCodeAt(0) % cardColors.length;
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

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
            <h1 className="text-xl font-bold text-foreground">Detalhes do Cartão</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-8 animate-fade-in">
        {/* Card Display - Styled like a real card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardColors[colorIndex]} p-8 shadow-2xl mb-6 min-h-[240px]`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            {/* Logo/Initial */}
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                {card.logo ? (
                  <img src={card.logo} alt={card.storeName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold drop-shadow-md">
                    {getInitial(card.storeName)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm font-medium">Cartão Fidelidade</p>
              </div>
            </div>

            {/* Store Name */}
            <h2 className="text-white text-2xl font-bold mb-2 drop-shadow-md">{card.storeName}</h2>
            
            {/* Card Number */}
            {card.cardNumber && (
              <p className="text-white/90 text-sm font-mono mb-6 drop-shadow">
                {card.cardNumber}
              </p>
            )}

            {/* Points Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-white/80 text-sm font-medium mb-1">Saldo de Pontos</p>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter 
                  value={animatedPoints} 
                  className="text-white text-4xl font-bold drop-shadow-md"
                />
                <span className="text-white/90 text-lg font-medium">
                  {animatedPoints === 1 ? "ponto" : "pontos"}
                </span>
              </div>
              {card.points >= 10 && (
                <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 animate-pulse">
                  <Gift className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">
                    Recompensa disponível!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Info */}
        <Card className="p-6 mb-6 border-0 shadow-md">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Informações do Cartão</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">Cadastrado em</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(card.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {card.updatedAt !== card.createdAt && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-sm text-muted-foreground">Última atualização</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(card.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* QR Code Button */}
        <Button
          onClick={() => setShowQRCode(true)}
          variant="outline"
          className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg mb-4"
          size="lg"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Mostrar QR Code
        </Button>

        {/* Transaction History Button */}
        <Button
          onClick={() => navigate(`/card/${id}/history`)}
          variant="outline"
          className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg mb-4"
          size="lg"
        >
          <History className="w-5 h-5 mr-2" />
          Ver histórico
        </Button>

        {/* Add Points & Collect Reward Buttons */}
        <div className="mb-4 space-y-3">
          {card.points >= 10 && (
            <Dialog open={isCollectRewardOpen} onOpenChange={setIsCollectRewardOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl bg-gradient-to-r from-success to-success/80" size="lg">
                  <Gift className="w-5 h-5 mr-2" />
                  Coletar Recompensa
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Coletar Recompensa</DialogTitle>
                  <DialogDescription>
                    Digite o PIN da loja para coletar sua recompensa
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
                      value={collectPinInput}
                      onChange={(e) => setCollectPinInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="0000"
                      className="h-14 text-lg text-center tracking-widest rounded-2xl"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCollectRewardOpen(false);
                      setCollectPinInput("");
                    }}
                    className="rounded-2xl"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCollectReward} className="rounded-2xl">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Pontos
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Adicionar Pontos</DialogTitle>
                <DialogDescription>
                  Digite o PIN da loja para adicionar pontos ao cartão
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
                    placeholder="Ex: 10"
                    className="h-14 text-lg rounded-2xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddPointsOpen(false);
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
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/edit-card/${card.id}`)}
            variant="outline"
            className="h-14 rounded-2xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-14 rounded-2xl">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Tem certeza que deseja excluir o cartão <span className="font-semibold">"{card.storeName}"</span>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Celebration Dialog */}
        {celebrationDialog.type && (
          <CelebrationDialog
            open={celebrationDialog.open}
            onClose={() => setCelebrationDialog({ open: false, type: null })}
            storeName={card.storeName}
            type={celebrationDialog.type}
          />
        )}

        {/* QR Code Display */}
        <QRCodeDisplay
          open={showQRCode}
          onClose={() => setShowQRCode(false)}
          card={card}
        />
      </main>
    </div>
  );
};

export default CardDetails;

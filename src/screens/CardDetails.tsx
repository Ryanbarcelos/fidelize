import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCards } from "@/hooks/useCards";
import { useAchievements } from "@/hooks/useAchievements";
import { useGamification } from "@/hooks/useGamification";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, Edit, Trash2, Gift, QrCode, History, Plus } from "lucide-react";
import { PinService } from "@/services/pinService";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatedCounter } from "@/components/gamification/AnimatedCounter";
import { CelebrationDialog } from "@/components/gamification/CelebrationDialog";
import { QRCodeDisplay, PinValidationDialog } from "@/components/cards";

const CardDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cards, updateCard, deleteCard, addTransaction } = useCards();
  const { updateAchievements, incrementRewardsCollected } = useAchievements();
  const { addReward } = useGamification();
  const { logAction, getLocation } = useAuditLog();
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false);
  const [celebrationDialog, setCelebrationDialog] = useState<{ open: boolean; type: "complete" | "reward" | null }>({ 
    open: false, 
    type: null 
  });
  const [animatedPoints, setAnimatedPoints] = useState(0);

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

  const handleDelete = async () => {
    if (!id) return;
    
    const location = await getLocation();
    
    const result = await deleteCard(id);
    if (result?.success) {
      await logAction({
        cardId: id,
        action: 'delete_card',
        status: 'success',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.success("Cartão excluído com sucesso!");
      navigate("/");
    } else {
      await logAction({
        cardId: id,
        action: 'delete_card',
        status: 'failed',
        errorMessage: result?.error,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error(result?.error || "Erro ao excluir cartão");
    }
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

  const handleCollectReward = async () => {
    if (card.points < 10) {
      toast.error("Você ainda não tem pontos suficientes para coletar uma recompensa");
      return;
    }
    
    const location = await getLocation();
    
    const result = await updateCard(card.id, { points: card.points - 10 });
    if (result?.success) {
      await addTransaction(card.id, "reward_collected", 10, card.storeName, card.userName);
      await incrementRewardsCollected();
      await addReward();
      
      await logAction({
        cardId: card.id,
        action: 'collect_reward',
        status: 'success',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      setAnimatedPoints(card.points - 10);
      setCelebrationDialog({ open: true, type: "reward" });
      triggerConfetti();
      toast.success("Recompensa coletada com sucesso! 🎉");
    } else {
      await logAction({
        cardId: card.id,
        action: 'collect_reward',
        status: 'failed',
        errorMessage: result?.error,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      toast.error(result?.error || "Erro ao coletar recompensa");
    }
  };

  const handleAddPointsPin = async (pin: string): Promise<boolean> => {
    const location = await getLocation();
    
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

    // Adicionar 1 ponto
    const newPoints = card.points + 1;
    const result = await updateCard(card.id, { points: newPoints });
    
    if (result?.success) {
      await addTransaction(card.id, "points_added", 1, card.storeName, card.userName);
      
      await logAction({
        cardId: card.id,
        action: 'add_points',
        status: 'success',
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      
      setAnimatedPoints(newPoints);
      toast.success("1 ponto adicionado com sucesso!");
      
      if (newPoints >= 10 && card.points < 10) {
        triggerConfetti();
        setCelebrationDialog({ open: true, type: "complete" });
      }
      
      return true;
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

            {/* Points Display with Progress */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 space-y-4">
              <div>
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
              </div>
              
              <ProgressBar 
                current={Math.min(card.points, 10)} 
                max={10}
              />
              
              {card.points >= 10 && (
                <div className="flex items-center gap-2 bg-success/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-success/30 animate-pulse">
                  <Gift className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">
                    🎉 Cartão completo! Você já pode resgatar sua recompensa!
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

        {/* Action Buttons */}
        <div className="mb-4 space-y-3">
          {/* Collect Reward Button */}
          {card.points >= 10 && (
            <Button 
              onClick={handleCollectReward}
              className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl bg-gradient-to-r from-success to-success/80" 
              size="lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Coletar Recompensa
            </Button>
          )}
          
          {/* Add Points Button */}
          <Button 
            onClick={() => setShowAddPointsDialog(true)}
            className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl" 
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Pontos
          </Button>
          
          {/* Show QR Code Button */}
          <Button 
            onClick={() => setShowQRCode(true)}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg" 
            size="lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Mostrar QR Code
          </Button>
        </div>

        {/* Transaction History Button */}
        <Button
          onClick={() => navigate(`/card/${id}/history`)}
          variant="outline"
          className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg mb-4"
          size="lg"
        >
          <History className="w-5 h-5 mr-2" />
          Ver histórico de transações
        </Button>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-destructive mb-4 text-lg">Zona de Perigo</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-foreground hover:bg-accent"
              onClick={() => navigate(`/edit-card/${id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Cartão
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Cartão
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o cartão
                    e todos os dados associados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </main>

      {/* QR Code Dialog */}
      <QRCodeDisplay 
        open={showQRCode} 
        onClose={() => setShowQRCode(false)} 
        card={card}
      />

      {/* Add Points PIN Dialog */}
      <PinValidationDialog
        open={showAddPointsDialog}
        onOpenChange={setShowAddPointsDialog}
        onValidate={handleAddPointsPin}
        title="Adicionar Pontos"
        description="Digite o PIN de 4 dígitos da loja para adicionar 1 ponto ao cartão."
        actionLabel="Adicionar Ponto"
      />

      {/* Celebration Dialog */}
      <CelebrationDialog
        open={celebrationDialog.open}
        onClose={() => setCelebrationDialog({ open: false, type: null })}
        type={celebrationDialog.type || "complete"}
        storeName={card.storeName}
      />
    </div>
  );
};

export default CardDetails;

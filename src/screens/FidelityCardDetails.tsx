import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { useCompanies } from "@/hooks/useCompanies";
import { useFidelityTransactions } from "@/hooks/useFidelityTransactions";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Gift, Plus, Upload, Camera, History } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatedCounter } from "@/components/gamification/AnimatedCounter";
import { CelebrationDialog } from "@/components/gamification/CelebrationDialog";

const FidelityCardDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cards, updateCardBalance, deleteCard, updateCardLogo } = useFidelityCards();
  const { validateCompanyPin } = useCompanies();
  const { addTransaction } = useFidelityTransactions(id);
  
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false);
  const [showEditLogoDialog, setShowEditLogoDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [newLogo, setNewLogo] = useState<string>("");
  const [celebrationDialog, setCelebrationDialog] = useState<{ open: boolean; type: "complete" | "reward" | null }>({ 
    open: false, 
    type: null 
  });
  const [animatedPoints, setAnimatedPoints] = useState(0);

  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    if (card) {
      setAnimatedPoints(card.balance);
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

  const storeName = card.company?.name || "Loja";

  const handleDelete = async () => {
    if (!id) return;
    
    const result = await deleteCard(id);
    if (result?.success) {
      toast.success("Cartão excluído com sucesso!");
      navigate("/");
    } else {
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
    if (card.balance < 10) {
      toast.error("Você ainda não tem pontos suficientes para coletar uma recompensa");
      return;
    }
    
    const newBalance = card.balance - 10;
    const result = await updateCardBalance(card.id, newBalance);
    if (result?.success) {
      // Record transaction
      await addTransaction(
        card.id,
        card.companyId,
        "reward_collected",
        10,
        newBalance,
        "customer"
      );
      
      setAnimatedPoints(newBalance);
      setCelebrationDialog({ open: true, type: "reward" });
      triggerConfetti();
      toast.success("Recompensa coletada com sucesso! 🎉");
    } else {
      toast.error(result?.error || "Erro ao coletar recompensa");
    }
  };

  const handleAddPointsSubmit = async () => {
    if (pin.length !== 4) {
      setPinError("Digite um PIN de 4 dígitos");
      return;
    }

    setIsValidating(true);
    setPinError("");

    try {
      const isValid = await validateCompanyPin(card.companyId, pin);
      
      if (!isValid) {
        setPinError("PIN incorreto. Tente novamente.");
        setIsValidating(false);
        return;
      }

      const newBalance = card.balance + 1;
      const result = await updateCardBalance(card.id, newBalance);
      
      if (result?.success) {
        // Record transaction
        await addTransaction(
          card.id,
          card.companyId,
          "points_added",
          1,
          newBalance,
          "customer"
        );
        
        setAnimatedPoints(newBalance);
        toast.success("1 ponto adicionado com sucesso!");
        setShowAddPointsDialog(false);
        setPin("");
        
        if (newBalance >= 10 && card.balance < 10) {
          triggerConfetti();
          setCelebrationDialog({ open: true, type: "complete" });
        }
      } else {
        toast.error(result?.error || "Erro ao adicionar pontos");
      }
    } catch (error) {
      setPinError("Erro ao validar PIN");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!newLogo) return;
    
    const result = await updateCardLogo(card.id, newLogo);
    if (result?.success) {
      toast.success("Logo atualizado com sucesso!");
      setShowEditLogoDialog(false);
      setNewLogo("");
    } else {
      toast.error(result?.error || "Erro ao atualizar logo");
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
  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "L";

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
        {/* Card Display */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardColors[colorIndex]} p-8 shadow-2xl mb-6 min-h-[240px]`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            {/* Logo/Initial */}
            <div className="flex justify-between items-start mb-8">
              <div 
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowEditLogoDialog(true)}
              >
                {card.logo ? (
                  <img src={card.logo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold drop-shadow-md">
                    {getInitial(storeName)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm font-medium">Cartão Fidelidade</p>
                <p className="text-white/60 text-xs mt-1">Código: {card.company?.shareCode}</p>
              </div>
            </div>

            {/* Store Name */}
            <h2 className="text-white text-2xl font-bold mb-6 drop-shadow-md">{storeName}</h2>

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
                current={Math.min(card.balance, 10)} 
                max={10}
              />
              
              {card.balance >= 10 && (
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
              <span className="text-sm text-muted-foreground">Loja</span>
              <span className="text-sm font-medium text-foreground">{storeName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">Código da Loja</span>
              <span className="text-sm font-medium text-foreground font-mono">{card.company?.shareCode}</span>
            </div>
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
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mb-4 space-y-3">
          {/* Collect Reward Button */}
          {card.balance >= 10 && (
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
          
          {/* Edit Logo Button */}
          <Button 
            onClick={() => setShowEditLogoDialog(true)}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg" 
            size="lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            {card.logo ? "Alterar Foto" : "Adicionar Foto"}
          </Button>
          
          {/* Transaction History Button */}
          <Button 
            onClick={() => navigate(`/fidelity-card/${id}/history`)}
            variant="outline"
            className="w-full h-14 text-lg rounded-2xl shadow-md hover:shadow-lg" 
            size="lg"
          >
            <History className="w-5 h-5 mr-2" />
            Ver Histórico de Transações
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-destructive mb-4 text-lg">Zona de Perigo</h3>
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
                  e todos os pontos acumulados.
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
        </Card>
      </main>

      {/* Add Points PIN Dialog */}
      <Dialog open={showAddPointsDialog} onOpenChange={(open) => {
        setShowAddPointsDialog(open);
        if (!open) {
          setPin("");
          setPinError("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Pontos</DialogTitle>
            <DialogDescription>
              Digite o PIN de 4 dígitos da loja para adicionar 1 ponto ao cartão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError("");
              }}
              placeholder="0000"
              className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
            {pinError && (
              <p className="text-sm text-destructive text-center">{pinError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPointsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPointsSubmit} disabled={isValidating || pin.length !== 4}>
              {isValidating ? "Validando..." : "Adicionar Ponto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Logo Dialog */}
      <Dialog open={showEditLogoDialog} onOpenChange={(open) => {
        setShowEditLogoDialog(open);
        if (!open) setNewLogo("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{card.logo ? "Alterar Foto" : "Adicionar Foto"}</DialogTitle>
            <DialogDescription>
              Adicione uma foto ou logo para personalizar seu cartão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="w-full h-12 rounded-2xl"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagem
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {(newLogo || card.logo) && (
              <div className="flex justify-center">
                <img
                  src={newLogo || card.logo}
                  alt="Preview"
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-border shadow-md"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLogoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLogo} disabled={!newLogo}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog */}
      <CelebrationDialog
        open={celebrationDialog.open}
        onClose={() => setCelebrationDialog({ open: false, type: null })}
        type={celebrationDialog.type || "complete"}
        storeName={storeName}
      />
    </div>
  );
};

export default FidelityCardDetails;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import { Store, Users, Plus, Gift, LogOut, History, Megaphone } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomerCard {
  cardId: string;
  customerName: string;
  points: number;
  card: LoyaltyCard;
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [, setCards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [customerCards, setCustomerCards] = useState<CustomerCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CustomerCard | null>(null);
  const [actionType, setActionType] = useState<"add" | "collect" | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== "business") {
      navigate("/login");
      return;
    }

    // Get all cards that belong to this store
    const storeCards = cards
      .filter((card) => card.storeName === currentUser.storeName)
      .map((card) => ({
        cardId: card.id,
        customerName: card.userName,
        points: card.points,
        card,
      }));

    setCustomerCards(storeCards);

    // Get all transactions for this store
    const transactions: Transaction[] = [];
    storeCards.forEach((customerCard) => {
      if (customerCard.card.transactions) {
        transactions.push(...customerCard.card.transactions);
      }
    });
    
    // Sort by most recent first
    const sortedTransactions = transactions.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setAllTransactions(sortedTransactions);
  }, [currentUser, cards, navigate]);

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
    if (!selectedCard) return;

    if (pinInput !== selectedCard.card.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    const points = parseInt(pointsToAdd) || 0;
    if (points <= 0) {
      toast.error("Por favor, insira uma quantidade válida de pontos");
      return;
    }

    const newPoints = selectedCard.points + points;
    
    // Create transaction record
    const newTransaction = {
      id: Date.now().toString(),
      cardId: selectedCard.cardId,
      type: "points_added" as const,
      points: points,
      storeName: selectedCard.card.storeName,
      userName: currentUser?.name,
      timestamp: new Date().toISOString(),
    };
    
    const updatedCards = cards.map((c) =>
      c.id === selectedCard.cardId
        ? { 
            ...c, 
            points: newPoints, 
            updatedAt: new Date().toISOString(),
            transactions: [...(c.transactions || []), newTransaction]
          }
        : c
    );
    setCards(updatedCards);

    triggerConfetti();
    toast.success(
      `${points} ${points === 1 ? "ponto adicionado" : "pontos adicionados"} com sucesso!`
    );

    if (newPoints >= 10 && selectedCard.points < 10) {
      setTimeout(() => {
        toast.success(
          `🎉 Cartão de ${selectedCard.customerName} completado! Recompensa disponível!`
        );
      }, 500);
    }

    resetDialog();
  };

  const handleCollectReward = () => {
    if (!selectedCard) return;

    if (pinInput !== selectedCard.card.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    if (selectedCard.points < 10) {
      toast.error("Este cartão ainda não tem 10 pontos para validar a recompensa");
      return;
    }

    // Create transaction record
    const newTransaction = {
      id: Date.now().toString(),
      cardId: selectedCard.cardId,
      type: "reward_collected" as const,
      points: 10,
      storeName: selectedCard.card.storeName,
      userName: currentUser?.name,
      timestamp: new Date().toISOString(),
    };

    const updatedCards = cards.map((c) =>
      c.id === selectedCard.cardId
        ? { 
            ...c, 
            points: 0, 
            updatedAt: new Date().toISOString(),
            transactions: [...(c.transactions || []), newTransaction]
          }
        : c
    );
    setCards(updatedCards);

    triggerConfetti();
    toast.success("Parabéns! Recompensa confirmada e cartão reiniciado.");

    resetDialog();
  };

  const resetDialog = () => {
    setSelectedCard(null);
    setActionType(null);
    setPinInput("");
    setPointsToAdd("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser || currentUser.accountType !== "business") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Painel da Loja</h1>
                <p className="text-sm text-muted-foreground">{currentUser.storeName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Stats Card */}
        <Card className="p-6 mb-6 border-0 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-foreground">{customerCards.length}</p>
            </div>
          </div>
        </Card>

        {/* Promotions Card */}
        <Card className="p-6 mb-6 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/promotions")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Promoções da Loja</p>
                <p className="text-sm text-muted-foreground">Crie e gerencie suas promoções</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-primary">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="customers">Cartões de Clientes</TabsTrigger>
            <TabsTrigger value="history">Histórico de Pontos</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            {/* Customer Cards List */}
            <div className="space-y-4">
              {customerCards.length === 0 ? (
                <Card className="p-8 text-center border-0 shadow-md">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum cliente ainda
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Os cartões de fidelidade dos seus clientes aparecerão aqui.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {customerCards.map((customerCard) => (
                    <Card
                      key={customerCard.cardId}
                      className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {customerCard.customerName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {customerCard.points} {customerCard.points === 1 ? "ponto" : "pontos"}
                          </p>
                        </div>
                        {customerCard.points >= 10 && (
                          <div className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-semibold">
                            Recompensa Disponível
                          </div>
                        )}
                      </div>

                      {/* Points Grid */}
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-xl flex items-center justify-center text-lg font-semibold transition-all ${
                              i < customerCard.points
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedCard(customerCard);
                            setActionType("add");
                          }}
                          className="flex-1 rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Pontos
                        </Button>
                        {customerCard.points >= 10 && (
                          <Button
                            onClick={() => {
                              setSelectedCard(customerCard);
                              setActionType("collect");
                            }}
                            className="flex-1 rounded-xl bg-success hover:bg-success/90"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Validar Recompensa
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {/* Transaction History */}
            <div className="space-y-4">
              {allTransactions.length === 0 ? (
                <Card className="p-8 text-center border-0 shadow-md">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Histórico vazio no momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    As transações de pontos dos seus clientes aparecerão aqui.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {allTransactions.map((transaction) => {
                    const customer = customerCards.find((c) => c.cardId === transaction.cardId);
                    const getTransactionIcon = () => {
                      switch (transaction.type) {
                        case "points_added":
                          return <Plus className="w-5 h-5 text-primary" />;
                        case "points_removed":
                          return <Plus className="w-5 h-5 text-destructive rotate-45" />;
                        case "reward_collected":
                          return <Gift className="w-5 h-5 text-amber-500" />;
                      }
                    };

                    const getTransactionColor = () => {
                      switch (transaction.type) {
                        case "points_added":
                          return "bg-primary/10 border-primary/20";
                        case "points_removed":
                          return "bg-destructive/10 border-destructive/20";
                        case "reward_collected":
                          return "bg-amber-500/10 border-amber-500/20";
                      }
                    };

                    return (
                      <Card
                        key={transaction.id}
                        className={`p-4 border shadow-sm ${getTransactionColor()}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                            {getTransactionIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {transaction.type === "reward_collected"
                                  ? "Recompensa coletada"
                                  : `${transaction.points} ${
                                      transaction.points === 1 ? "ponto" : "pontos"
                                    } ${
                                      transaction.type === "points_added"
                                        ? "adicionados"
                                        : "removidos"
                                    }`}
                              </h3>
                              {transaction.type === "reward_collected" && (
                                <span className="text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full flex-shrink-0">
                                  🏆 10 pontos
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {customer?.customerName || "Cliente desconhecido"}
                              {transaction.userName && ` · por ${transaction.userName}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(transaction.timestamp), "dd/MM/yyyy - HH:mm", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Points Dialog */}
      <Dialog open={actionType === "add"} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Adicionar Pontos</DialogTitle>
            <DialogDescription>
              Cliente: <span className="font-semibold">{selectedCard?.customerName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-base">
                PIN da Loja
              </Label>
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
              <Label htmlFor="pointsAmount" className="text-base">
                Quantidade de pontos
              </Label>
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
            <Button onClick={handleAddPoints} className="rounded-2xl">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collect Reward Dialog */}
      <Dialog
        open={actionType === "collect"}
        onOpenChange={(open) => !open && setActionType(null)}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Validar Recompensa</DialogTitle>
            <DialogDescription>
              Cliente: <span className="font-semibold">{selectedCard?.customerName}</span>
              <br />
              Digite o PIN da loja para validar a recompensa e reiniciar o cartão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collectPin" className="text-base">
                PIN da Loja
              </Label>
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
            <Button onClick={handleCollectReward} className="rounded-2xl">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessDashboard;

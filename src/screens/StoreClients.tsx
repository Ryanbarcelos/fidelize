import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCards } from "@/hooks/useCards";
import { useFidelityCards, FidelityClient } from "@/hooks/useFidelityCards";
import { useCompanies } from "@/hooks/useCompanies";
import { useFidelityTransactions } from "@/hooks/useFidelityTransactions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Search, User, TrendingUp, Gift, Users, Plus, Minus, ChevronDown, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ClientPointsChart } from "@/components/charts/ClientPointsChart";

interface ClientTransaction {
  id: string;
  type: string;
  points: number;
  balance_after: number;
  created_at: string;
}

const StoreClients = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cards, loading: cardsLoading } = useCards();
  const { clients, loading: clientsLoading, updateCardBalance, refetchClients } = useFidelityCards();
  const { company, validateCompanyPin } = useCompanies();
  const { addTransaction } = useFidelityTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state for adding points
  const [selectedClient, setSelectedClient] = useState<FidelityClient | null>(null);
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false);
  const [pointsAction, setPointsAction] = useState<"add" | "remove">("add");
  const [pointsAmount, setPointsAmount] = useState("1");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  
  // Chart state
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [clientTransactions, setClientTransactions] = useState<Record<string, ClientTransaction[]>>({});
  const [loadingTransactions, setLoadingTransactions] = useState<Set<string>>(new Set());

  const toggleClientChart = async (clientId: string, cardId: string) => {
    const newExpanded = new Set(expandedClients);
    
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
      
      // Fetch transactions if not already loaded
      if (!clientTransactions[clientId]) {
        setLoadingTransactions(prev => new Set(prev).add(clientId));
        try {
          const { data, error } = await supabase
            .from("fidelity_transactions")
            .select("id, type, points, balance_after, created_at")
            .eq("fidelity_card_id", cardId)
            .order("created_at", { ascending: true });
          
          if (!error && data) {
            setClientTransactions(prev => ({ ...prev, [clientId]: data }));
          }
        } catch (err) {
          console.error("Error fetching transactions:", err);
        } finally {
          setLoadingTransactions(prev => {
            const next = new Set(prev);
            next.delete(clientId);
            return next;
          });
        }
      }
    }
    
    setExpandedClients(newExpanded);
  };

  // Get legacy cards from loyalty_cards table
  const storeCards = useMemo(() => {
    const storeName = currentUser?.storeName || "";
    let filtered = cards.filter(c => c.storeName === storeName);
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by points (descending)
    filtered.sort((a, b) => b.points - a.points);
    
    return filtered;
  }, [cards, currentUser, searchQuery]);

  // Filter fidelity clients by search
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c => 
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Total clients from new fidelity_cards table
  const totalFidelityClients = clients.length;

  const getTotalRewards = (card: any) => {
    return card.transactions?.filter((t: any) => t.type === 'reward_collected').length || 0;
  };

  const getLastVisit = (card: any) => {
    const transactions = card.transactions || [];
    if (transactions.length === 0) return "Nunca";
    
    const lastTransaction = transactions[transactions.length - 1];
    const date = new Date(lastTransaction.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  const openAddPointsDialog = (client: FidelityClient, action: "add" | "remove") => {
    setSelectedClient(client);
    setPointsAction(action);
    setPointsAmount("1");
    setPin("");
    setPinError("");
    setShowAddPointsDialog(true);
  };

  const handlePointsSubmit = async () => {
    if (pin.length !== 4) {
      setPinError("Digite um PIN de 4 dígitos");
      return;
    }

    if (!selectedClient || !company) return;

    const amount = parseInt(pointsAmount) || 1;
    if (amount < 1) {
      setPinError("Quantidade inválida");
      return;
    }

    setIsValidating(true);
    setPinError("");

    try {
      const isValid = await validateCompanyPin(company.id, pin);
      
      if (!isValid) {
        setPinError("PIN incorreto. Tente novamente.");
        setIsValidating(false);
        return;
      }

      const newBalance = pointsAction === "add" 
        ? selectedClient.balance + amount 
        : Math.max(0, selectedClient.balance - amount);

      const result = await updateCardBalance(selectedClient.id, newBalance);
      
      if (result?.success) {
        // Record transaction
        await addTransaction(
          selectedClient.id,
          company.id,
          pointsAction === "add" ? "points_added" : "points_removed",
          amount,
          newBalance,
          "business"
        );
        
        await refetchClients();
        toast.success(
          pointsAction === "add" 
            ? `${amount} ponto(s) adicionado(s) com sucesso!` 
            : `${amount} ponto(s) removido(s) com sucesso!`
        );
        setShowAddPointsDialog(false);
      } else {
        toast.error(result?.error || "Erro ao atualizar pontos");
      }
    } catch (error) {
      setPinError("Erro ao validar PIN");
    } finally {
      setIsValidating(false);
    }
  };

  const loading = cardsLoading || clientsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/business-dashboard")}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Lista de Clientes</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Summary - Now shows real count from fidelity_cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 border-0 shadow-md rounded-2xl bg-gradient-to-br from-primary/5 to-primary-light/5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Clientes (Novo Sistema)</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalFidelityClients}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clientes (Legado)</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{storeCards.length}</p>
          </Card>
        </div>

        {/* Fidelity Cards Clients */}
        {filteredClients.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-foreground mb-3">Clientes do Novo Sistema</h3>
            <div className="space-y-3">
              {filteredClients.map((client, index) => {
                const progress = (client.balance / 10) * 100;
                const isExpanded = expandedClients.has(client.id);
                const isLoadingChart = loadingTransactions.has(client.id);
                const transactions = clientTransactions[client.id] || [];
                
                return (
                  <Card 
                    key={client.id}
                    className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">Cliente #{client.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          
                          {/* Points Progress */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground">Progresso</span>
                              <span className="text-sm font-medium text-foreground">
                                {client.balance}/10 pontos
                              </span>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                          </div>
                          
                          {/* Status Badge */}
                          {client.balance >= 10 && (
                            <div className="inline-flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-lg text-xs font-medium mb-2">
                              <Gift className="w-3 h-3" />
                              Recompensa disponível
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => openAddPointsDialog(client, "add")}
                              className="flex-1 h-9 rounded-xl"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAddPointsDialog(client, "remove")}
                              className="flex-1 h-9 rounded-xl"
                              disabled={client.balance === 0}
                            >
                              <Minus className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{client.balance}</p>
                          <p className="text-xs text-muted-foreground">pontos</p>
                        </div>
                      </div>
                      
                      {/* Chart Toggle Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleClientChart(client.id, client.id)}
                        className="w-full mt-3 h-8 text-muted-foreground hover:text-foreground"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Evolução de Pontos
                        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </Button>
                    </div>
                    
                    {/* Collapsible Chart */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-green-200 dark:border-green-800">
                        {isLoadingChart ? (
                          <div className="h-48 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                        ) : (
                          <div className="pt-4">
                            <ClientPointsChart 
                              transactions={transactions} 
                              clientId={client.id} 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Legacy Clients List */}
        <h3 className="font-bold text-foreground mb-3">Clientes (Sistema Legado)</h3>
        {storeCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Os clientes aparecerão aqui quando adicionarem seu cartão"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {storeCards.map((card, index) => {
              const totalRewards = getTotalRewards(card);
              const lastVisit = getLastVisit(card);
              const progress = (card.points / 10) * 100;
              
              return (
                <Card 
                  key={card.id}
                  className="p-4 border-0 shadow-md rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/card/${card.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">
                        {card.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground mb-1 truncate">
                        {card.userName}
                      </h3>
                      
                      <div className="space-y-2">
                        {/* Points Progress */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-muted-foreground">Progresso</span>
                            <span className="text-sm font-medium text-foreground">
                              {card.points}/10 pontos
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{lastVisit}</span>
                          </div>
                          {totalRewards > 0 && (
                            <div className="flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              <span>{totalRewards} {totalRewards === 1 ? "recompensa" : "recompensas"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {card.points >= 10 && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-lg text-xs font-medium">
                          <Gift className="w-3 h-3" />
                          Recompensa disponível
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Remove Points Dialog */}
      <Dialog open={showAddPointsDialog} onOpenChange={(open) => {
        setShowAddPointsDialog(open);
        if (!open) {
          setPin("");
          setPinError("");
          setSelectedClient(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pointsAction === "add" ? "Adicionar Pontos" : "Remover Pontos"}
            </DialogTitle>
            <DialogDescription>
              {selectedClient && (
                <span>
                  Cliente #{selectedClient.id.slice(0, 8)} • Saldo atual: {selectedClient.balance} pontos
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Points Amount */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantidade de pontos
              </label>
              <Input
                type="number"
                min="1"
                max={pointsAction === "remove" ? selectedClient?.balance : 100}
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                className="h-12 text-center text-xl font-bold"
              />
            </div>
            
            {/* PIN Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                PIN da Loja (4 dígitos)
              </label>
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
              />
            </div>
            
            {pinError && (
              <p className="text-sm text-destructive text-center">{pinError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPointsDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePointsSubmit} 
              disabled={isValidating || pin.length !== 4}
              className={pointsAction === "remove" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isValidating ? "Validando..." : pointsAction === "add" ? "Adicionar" : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreClients;
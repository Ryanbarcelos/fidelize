import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCards } from "@/hooks/useCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User, TrendingUp, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StoreClients = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cards, loading } = useCards();
  const [searchQuery, setSearchQuery] = useState("");

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
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Summary */}
        <Card className="p-4 mb-6 border-0 shadow-md rounded-2xl bg-gradient-to-br from-primary/5 to-primary-light/5">
          <p className="text-sm text-muted-foreground mb-1">Total de Clientes</p>
          <p className="text-3xl font-bold text-foreground">{storeCards.length}</p>
        </Card>

        {/* Clients List */}
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
    </div>
  );
};

export default StoreClients;

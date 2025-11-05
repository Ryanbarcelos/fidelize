import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { Transaction, getTransactionLabel } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Gift } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    if (card?.transactions) {
      // Sort by most recent first
      const sorted = [...card.transactions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setTransactions(sorted);
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

  const getTransactionIconComponent = (type: Transaction["type"]) => {
    switch (type) {
      case "points_added":
        return <Plus className="w-5 h-5 text-primary" />;
      case "points_removed":
        return <Minus className="w-5 h-5 text-destructive" />;
      case "reward_collected":
        return <Gift className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "points_added":
        return "bg-primary/10 border-primary/20";
      case "points_removed":
        return "bg-destructive/10 border-destructive/20";
      case "reward_collected":
        return "bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/card/${id}`)}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Histórico de Transações</h1>
              <p className="text-sm text-muted-foreground">{card.storeName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 animate-fade-in">
        {transactions.length === 0 ? (
          <Card className="p-8 text-center border-0 shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Histórico vazio no momento
            </h3>
            <p className="text-sm text-muted-foreground">
              As transações de pontos aparecerão aqui quando você adicionar ou coletar recompensas.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className={`p-4 border shadow-sm hover:shadow-md transition-all ${getTransactionColor(
                  transaction.type
                )}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                    {getTransactionIconComponent(transaction.type)}
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
                      {transaction.storeName}
                      {transaction.userName && ` · ${transaction.userName}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(transaction.timestamp), "dd/MM/yyyy - HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TransactionHistory;

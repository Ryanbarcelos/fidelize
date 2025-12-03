import { useNavigate, useParams } from "react-router-dom";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { useFidelityTransactions } from "@/hooks/useFidelityTransactions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Gift, TrendingUp } from "lucide-react";

const FidelityTransactionHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cards } = useFidelityCards();
  const { transactions, loading } = useFidelityTransactions(id);

  const card = cards.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "points_added":
        return <Plus className="w-5 h-5 text-green-500" />;
      case "points_removed":
        return <Minus className="w-5 h-5 text-red-500" />;
      case "reward_collected":
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-primary" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "points_added":
        return "Pontos adicionados";
      case "points_removed":
        return "Pontos removidos";
      case "reward_collected":
        return "Recompensa coletada";
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "points_added":
        return "text-green-600";
      case "points_removed":
        return "text-red-600";
      case "reward_collected":
        return "text-purple-600";
      default:
        return "text-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              onClick={() => navigate(-1)}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Histórico de Transações</h1>
              {card && (
                <p className="text-sm text-muted-foreground">{card.company?.name}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Current Balance */}
        {card && (
          <Card className="p-6 mb-6 border-0 shadow-md rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Saldo Atual</p>
                <p className="text-4xl font-bold text-foreground">{card.balance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{transactions.length}</p>
                <p className="text-xs text-muted-foreground">transações</p>
              </div>
            </div>
          </Card>
        )}

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nenhuma transação</h2>
            <p className="text-muted-foreground">
              As transações aparecerão aqui quando você acumular ou usar pontos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <Card
                key={transaction.id}
                className="p-4 border-0 shadow-md rounded-2xl fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === "points_added" 
                      ? "bg-green-100 dark:bg-green-900/30" 
                      : transaction.type === "points_removed"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-purple-100 dark:bg-purple-900/30"
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {getTransactionLabel(transaction.type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por: {transaction.createdBy === "business" ? "Lojista" : "Cliente"}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === "points_removed" || transaction.type === "reward_collected" 
                        ? `-${transaction.points}` 
                        : `+${transaction.points}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {transaction.balanceAfter}
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

export default FidelityTransactionHistory;
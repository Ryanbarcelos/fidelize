import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Clock, 
  User, 
  ChevronRight,
  Bell,
  UserX
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Client {
  id: string;
  balance: number;
  createdAt: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  created_at: string | null;
  type: string;
  points: number;
}

interface InactiveClientsAlertProps {
  clients: Client[];
  transactions: Transaction[];
  inactiveDaysThreshold?: number;
}

interface InactiveClient extends Client {
  lastActivityDate: Date;
  daysInactive: number;
}

export const InactiveClientsAlert = ({ 
  clients, 
  transactions, 
  inactiveDaysThreshold = 30 
}: InactiveClientsAlertProps) => {
  const navigate = useNavigate();

  const inactiveClients = useMemo(() => {
    const now = new Date();
    const result: InactiveClient[] = [];

    clients.forEach(client => {
      // Find the client's last transaction
      const clientTransactions = transactions.filter(t => t.user_id === client.userId);
      
      let lastActivityDate: Date;
      if (clientTransactions.length > 0) {
        const sortedTransactions = clientTransactions.sort((a, b) => 
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        );
        lastActivityDate = new Date(sortedTransactions[0].created_at!);
      } else {
        // If no transactions, use the card creation date
        lastActivityDate = new Date(client.createdAt);
      }

      const daysInactive = differenceInDays(now, lastActivityDate);

      if (daysInactive >= inactiveDaysThreshold) {
        result.push({
          ...client,
          lastActivityDate,
          daysInactive,
        });
      }
    });

    // Sort by days inactive (most inactive first)
    return result.sort((a, b) => b.daysInactive - a.daysInactive);
  }, [clients, transactions, inactiveDaysThreshold]);

  const getInactivityLevel = (days: number): { color: string; bgColor: string; label: string } => {
    if (days >= 90) {
      return { 
        color: "text-red-600 dark:text-red-400", 
        bgColor: "bg-red-100 dark:bg-red-900/30",
        label: "Crítico" 
      };
    }
    if (days >= 60) {
      return { 
        color: "text-orange-600 dark:text-orange-400", 
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        label: "Alto" 
      };
    }
    return { 
      color: "text-yellow-600 dark:text-yellow-400", 
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      label: "Moderado" 
    };
  };

  if (inactiveClients.length === 0) {
    return null;
  }

  const criticalCount = inactiveClients.filter(c => c.daysInactive >= 90).length;
  const highCount = inactiveClients.filter(c => c.daysInactive >= 60 && c.daysInactive < 90).length;

  return (
    <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-l-4 border-l-red-500">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Clientes Inativos
          </h3>
          <p className="text-sm text-muted-foreground">
            {inactiveClients.length} cliente{inactiveClients.length !== 1 ? 's' : ''} sem atividade há mais de {inactiveDaysThreshold} dias
          </p>
        </div>
      </div>

      {/* Summary badges */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium">
              <UserX className="w-3 h-3" />
              {criticalCount} crítico{criticalCount !== 1 ? 's' : ''} (+90 dias)
            </span>
          )}
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {highCount} alto{highCount !== 1 ? 's' : ''} (+60 dias)
            </span>
          )}
        </div>
      )}

      {/* Client list (show up to 5) */}
      <div className="space-y-2">
        {inactiveClients.slice(0, 5).map((client) => {
          const level = getInactivityLevel(client.daysInactive);
          return (
            <div 
              key={client.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${level.bgColor}`}
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {client.userName || `Cliente #${client.id.slice(0, 6)}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {client.userEmail || `Saldo: ${client.balance} pts`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${level.color}`}>
                  {client.daysInactive} dias
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  {format(client.lastActivityDate, "dd/MM/yy", { locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View all button */}
      {inactiveClients.length > 5 && (
        <Button
          variant="ghost"
          className="w-full mt-3 text-sm"
          onClick={() => navigate("/store-clients")}
        >
          Ver todos os {inactiveClients.length} clientes inativos
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {/* Action tip */}
      <div className="mt-4 p-3 bg-background/50 rounded-xl">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Entre em contato com clientes inativos oferecendo 
          promoções exclusivas para reativá-los!
        </p>
      </div>
    </Card>
  );
};
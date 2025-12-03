import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  type: string;
  points: number;
  balance_after: number;
  created_at: string;
}

interface ClientPointsChartProps {
  transactions: Transaction[];
  clientId: string;
}

export const ClientPointsChart = ({ transactions, clientId }: ClientPointsChartProps) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Sort by date ascending
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sorted.map((t) => ({
      date: format(new Date(t.created_at), "dd/MM", { locale: ptBR }),
      fullDate: format(new Date(t.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      pontos: t.balance_after,
      tipo: t.type === "points_added" ? "Adicionado" : t.type === "points_removed" ? "Removido" : "Recompensa",
      pontosMovimentados: t.points,
    }));
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
        Nenhuma transação registrada
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${clientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
            formatter={(value: number, name: string) => [
              `${value} pontos`,
              "Saldo"
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Area
            type="monotone"
            dataKey="pontos"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill={`url(#gradient-${clientId})`}
            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

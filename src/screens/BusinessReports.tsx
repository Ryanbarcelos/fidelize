import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AnimatedCounter } from "@/components/gamification/AnimatedCounter";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Gift, 
  Users, 
  Calendar,
  BarChart3,
  Minus,
  FileText,
  Download,
  FileSpreadsheet,
  Crown,
  Activity,
  Target,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PeriodFilter = "today" | "week" | "month" | "year" | "all";

const BusinessReports = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { company } = useCompanies();
  const { clients } = useFidelityCards();
  const [period, setPeriod] = useState<PeriodFilter>("month");

  const getDateRange = (periodFilter: PeriodFilter) => {
    const now = new Date();
    switch (periodFilter) {
      case "today":
        return startOfDay(now);
      case "week":
        return startOfWeek(now, { weekStartsOn: 0 });
      case "month":
        return startOfMonth(now);
      case "year":
        return startOfYear(now);
      default:
        return new Date(0);
    }
  };

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["business-reports", company?.id, period],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const startDate = getDateRange(period);
      
      let query = supabase
        .from("fidelity_transactions")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      
      if (period !== "all") {
        query = query.gte("created_at", startDate.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id,
  });

  // Fetch previous period transactions for comparison
  const { data: previousTransactions = [] } = useQuery({
    queryKey: ["business-reports-previous", company?.id, period],
    queryFn: async () => {
      if (!company?.id || period === "all") return [];
      
      const currentStart = getDateRange(period);
      const daysDiff = differenceInDays(new Date(), currentStart);
      const previousStart = subDays(currentStart, daysDiff + 1);
      const previousEnd = subDays(currentStart, 1);
      
      const { data, error } = await supabase
        .from("fidelity_transactions")
        .select("*")
        .eq("company_id", company.id)
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", currentStart.toISOString());
      
      if (error) return [];
      return data || [];
    },
    enabled: !!company?.id && period !== "all",
  });

  // Fetch earned promotions data
  const { data: earnedPromotions = [] } = useQuery({
    queryKey: ["business-promotions-report", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from("earned_promotions")
        .select(`
          *,
          automatic_promotions!inner(company_id)
        `)
        .eq("automatic_promotions.company_id", company.id);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!company?.id,
  });

  // Calculate main stats
  const stats = useMemo(() => {
    const pointsAdded = transactions
      .filter(t => t.type === "points_added")
      .reduce((sum, t) => sum + t.points, 0);
    
    const pointsRemoved = transactions
      .filter(t => t.type === "points_removed")
      .reduce((sum, t) => sum + Math.abs(t.points), 0);
    
    const rewardsCollected = transactions
      .filter(t => t.type === "reward_collected")
      .length;
    
    const activeClientIds = new Set(transactions.map(t => t.user_id));
    const activeClients = activeClientIds.size;
    
    return {
      pointsAdded,
      pointsRemoved,
      rewardsCollected,
      activeClients,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  // Calculate previous period stats for comparison
  const previousStats = useMemo(() => {
    const pointsAdded = previousTransactions
      .filter(t => t.type === "points_added")
      .reduce((sum, t) => sum + t.points, 0);
    
    const activeClientIds = new Set(previousTransactions.map(t => t.user_id));
    
    return {
      pointsAdded,
      activeClients: activeClientIds.size,
      totalTransactions: previousTransactions.length,
    };
  }, [previousTransactions]);

  // Calculate growth percentages
  const growth = useMemo(() => {
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      points: calcGrowth(stats.pointsAdded, previousStats.pointsAdded),
      clients: calcGrowth(stats.activeClients, previousStats.activeClients),
      transactions: calcGrowth(stats.totalTransactions, previousStats.totalTransactions),
    };
  }, [stats, previousStats]);

  // Top clients data
  const topClients = useMemo(() => {
    const clientPoints: Record<string, { points: number; transactions: number; userId: string }> = {};
    
    transactions.forEach(t => {
      if (!clientPoints[t.user_id]) {
        clientPoints[t.user_id] = { points: 0, transactions: 0, userId: t.user_id };
      }
      if (t.type === "points_added") {
        clientPoints[t.user_id].points += t.points;
      }
      clientPoints[t.user_id].transactions++;
    });

    const sorted = Object.values(clientPoints)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    // Match with client names
    return sorted.map((item, index) => {
      const client = clients.find(c => c.userId === item.userId);
      return {
        rank: index + 1,
        name: client?.userName || `Cliente #${item.userId.slice(0, 6)}`,
        email: client?.userEmail,
        points: item.points,
        transactions: item.transactions,
        balance: client?.balance || 0,
      };
    });
  }, [transactions, clients]);

  // Daily evolution data for line chart
  const evolutionData = useMemo(() => {
    const days = period === "today" ? 24 : period === "week" ? 7 : period === "month" ? 30 : 12;
    const data: { name: string; pontos: number; clientes: number; transacoes: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStr = period === "today" 
        ? `${23 - i}h`
        : period === "year" 
          ? format(date, "MMM", { locale: ptBR })
          : format(date, "dd/MM");
      
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at!);
        if (period === "today") {
          return transDate.getHours() === (23 - i) && 
                 format(transDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
        }
        if (period === "year") {
          return transDate.getMonth() === date.getMonth() && 
                 transDate.getFullYear() === date.getFullYear();
        }
        return format(transDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      });
      
      const pontos = dayTransactions
        .filter(t => t.type === "points_added")
        .reduce((sum, t) => sum + t.points, 0);
      
      const clientes = new Set(dayTransactions.map(t => t.user_id)).size;
      const transacoes = dayTransactions.length;
      
      data.push({ name: dayStr, pontos, clientes, transacoes });
    }
    
    return data;
  }, [transactions, period]);

  // Activity by hour of day
  const hourlyActivity = useMemo(() => {
    const hours = Array(24).fill(0);
    
    transactions.forEach(t => {
      const hour = new Date(t.created_at!).getHours();
      hours[hour]++;
    });

    return hours.map((count, hour) => ({
      hour: `${hour}h`,
      atividade: count,
    }));
  }, [transactions]);

  // Activity by day of week
  const weekdayActivity = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = Array(7).fill(0);
    
    transactions.forEach(t => {
      const day = new Date(t.created_at!).getDay();
      counts[day]++;
    });

    return days.map((name, i) => ({
      name,
      atividade: counts[i],
    }));
  }, [transactions]);

  // Promotions stats
  const promotionsStats = useMemo(() => {
    const total = earnedPromotions.length;
    const redeemed = earnedPromotions.filter(p => p.is_redeemed).length;
    const pending = earnedPromotions.filter(p => p.pending_redemption && !p.is_redeemed).length;
    const available = total - redeemed - pending;
    
    return { total, redeemed, pending, available };
  }, [earnedPromotions]);

  const pieData = useMemo(() => {
    return [
      { name: "Pontos Adicionados", value: stats.pointsAdded, color: "hsl(142, 76%, 36%)" },
      { name: "Pontos Removidos", value: stats.pointsRemoved, color: "hsl(0, 84%, 60%)" },
      { name: "Recompensas", value: stats.rewardsCollected * 10, color: "hsl(262, 83%, 58%)" },
    ].filter(d => d.value > 0);
  }, [stats]);

  const periodLabels: Record<PeriodFilter, string> = {
    today: "Hoje",
    week: "Esta Semana",
    month: "Este Mês",
    year: "Este Ano",
    all: "Todo o Período",
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "points_added": return "Pontos Adicionados";
      case "points_removed": return "Pontos Removidos";
      case "reward_collected": return "Recompensa Coletada";
      default: return type;
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ["Data", "Tipo", "Pontos", "Saldo Após", "Criado Por"];
      const rows = transactions.map(t => [
        format(new Date(t.created_at!), "dd/MM/yyyy HH:mm"),
        getTypeLabel(t.type),
        t.points.toString(),
        t.balance_after.toString(),
        t.created_by === "business" ? "Loja" : "Cliente"
      ]);

      const csvContent = [
        `Relatório - ${currentUser?.storeName}`,
        `Período: ${periodLabels[period]}`,
        `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        "",
        "RESUMO",
        `Pontos Distribuídos,${stats.pointsAdded}`,
        `Pontos Removidos,${stats.pointsRemoved}`,
        `Recompensas Coletadas,${stats.rewardsCollected}`,
        `Clientes Ativos,${stats.activeClients}`,
        `Total de Transações,${stats.totalTransactions}`,
        "",
        "TRANSAÇÕES",
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_${currentUser?.storeName?.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.csv`;
      link.click();
      
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text("Relatório de Fidelidade", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(currentUser?.storeName || "Minha Loja", pageWidth / 2, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${periodLabels[period]}`, pageWidth / 2, 38, { align: "center" });
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth / 2, 44, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Resumo", 14, 58);
      
      autoTable(doc, {
        startY: 62,
        head: [["Métrica", "Valor", "Variação"]],
        body: [
          ["Pontos Distribuídos", stats.pointsAdded.toString(), `${growth.points >= 0 ? '+' : ''}${growth.points}%`],
          ["Pontos Removidos", stats.pointsRemoved.toString(), "-"],
          ["Recompensas Coletadas", stats.rewardsCollected.toString(), "-"],
          ["Clientes Ativos", `${stats.activeClients} de ${clients.length}`, `${growth.clients >= 0 ? '+' : ''}${growth.clients}%`],
          ["Total de Transações", stats.totalTransactions.toString(), `${growth.transactions >= 0 ? '+' : ''}${growth.transactions}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
      });

      // Top Clients
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.text("Top 5 Clientes", 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [["#", "Cliente", "Pontos Ganhos", "Transações"]],
        body: topClients.map(c => [
          c.rank.toString(),
          c.name,
          c.points.toString(),
          c.transactions.toString()
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`relatorio_${currentUser?.storeName?.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const GrowthIndicator = ({ value, label }: { value: number; label: string }) => (
    <div className={`flex items-center gap-1 text-xs font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {value >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      <span>{value >= 0 ? '+' : ''}{value}%</span>
      <span className="text-muted-foreground font-normal">vs {label}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-glow text-white p-6 shadow-premium-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 rounded-2xl"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Análise Inteligente</h1>
              <p className="text-white/80 text-sm">{currentUser?.storeName}</p>
            </div>
            <Activity className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Filter & Export Buttons */}
        <Card className="p-4 rounded-2xl border-0 shadow-premium">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Período:</span>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="all">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={exportToPDF}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Main KPIs with Growth */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Pontos Distribuídos</p>
            <AnimatedCounter 
              value={stats.pointsAdded} 
              className="text-2xl font-bold text-foreground"
            />
            {period !== "all" && <GrowthIndicator value={growth.points} label="período anterior" />}
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Clientes Ativos</p>
            <AnimatedCounter 
              value={stats.activeClients} 
              className="text-2xl font-bold text-foreground"
            />
            {period !== "all" && <GrowthIndicator value={growth.clients} label="período anterior" />}
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Transações</p>
            <AnimatedCounter 
              value={stats.totalTransactions} 
              className="text-2xl font-bold text-foreground"
            />
            {period !== "all" && <GrowthIndicator value={growth.transactions} label="período anterior" />}
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Promoções Resgatadas</p>
            <AnimatedCounter 
              value={promotionsStats.redeemed} 
              className="text-2xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {promotionsStats.pending} pendentes
            </p>
          </Card>
        </div>

        {/* Evolution Line Chart */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Evolução - {periodLabels[period]}
          </h3>
          
          {evolutionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData.slice(-14)}>
                  <defs>
                    <linearGradient id="colorPontos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="pontos" 
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorPontos)"
                    name="Pontos"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone"
                    dataKey="clientes" 
                    stroke="hsl(var(--chart-2))" 
                    name="Clientes"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Nenhuma transação no período selecionado
            </div>
          )}
        </Card>

        {/* Top 5 Clients */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Top 5 Clientes Mais Ativos
          </h3>
          
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30' :
                    index === 1 ? 'bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/30 dark:to-gray-800/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' :
                    'bg-muted/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500' :
                    'bg-muted-foreground/50'
                  }`}>
                    {client.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{client.points} pts</p>
                    <p className="text-xs text-muted-foreground">{client.transactions} transações</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente ativo no período
            </div>
          )}
        </Card>

        {/* Activity by Day of Week */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Atividade por Dia da Semana
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayActivity}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="atividade" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                  name="Transações"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity by Hour */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horários de Pico
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivity.filter((_, i) => i >= 6 && i <= 23)}>
                <defs>
                  <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone"
                  dataKey="atividade" 
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorHourly)"
                  name="Transações"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Card className="p-6 rounded-2xl border-0 shadow-premium">
            <h3 className="font-bold text-foreground mb-4">Distribuição de Atividades</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Business Insights */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-primary/5 to-primary/10">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Insights do Negócio
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Taxa de Engajamento</p>
                <p className="text-muted-foreground">
                  {clients.length > 0 
                    ? `${Math.round((stats.activeClients / clients.length) * 100)}% dos clientes estão ativos`
                    : 'Nenhum cliente cadastrado'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Média por Transação</p>
                <p className="text-muted-foreground">
                  {transactions.filter(t => t.type === "points_added").length > 0 
                    ? `${Math.round(stats.pointsAdded / transactions.filter(t => t.type === "points_added").length)} pontos por compra`
                    : 'Nenhuma transação'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Promoções Automáticas</p>
                <p className="text-muted-foreground">
                  {promotionsStats.total} ganhas • {promotionsStats.redeemed} resgatadas • {promotionsStats.pending} aguardando
                </p>
              </div>
            </div>

            {topClients[0] && (
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Melhor Cliente</p>
                  <p className="text-muted-foreground">
                    {topClients[0].name} com {topClients[0].points} pontos ganhos
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BusinessReports;
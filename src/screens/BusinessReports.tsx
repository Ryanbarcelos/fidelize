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
  Gift, 
  Users, 
  Calendar,
  BarChart3,
  Minus,
  FileText,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
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
  Cell
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

  const dailyData = useMemo(() => {
    const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 12;
    const data: { name: string; pontos: number; recompensas: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStr = period === "year" 
        ? format(date, "MMM", { locale: ptBR })
        : format(date, "dd/MM");
      
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at!);
        if (period === "year") {
          return transDate.getMonth() === date.getMonth() && 
                 transDate.getFullYear() === date.getFullYear();
        }
        return format(transDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      });
      
      const pontos = dayTransactions
        .filter(t => t.type === "points_added")
        .reduce((sum, t) => sum + t.points, 0);
      
      const recompensas = dayTransactions
        .filter(t => t.type === "reward_collected")
        .length;
      
      data.push({ name: dayStr, pontos, recompensas });
    }
    
    return data;
  }, [transactions, period]);

  const pieData = useMemo(() => {
    return [
      { name: "Pontos Adicionados", value: stats.pointsAdded, color: "hsl(var(--chart-1))" },
      { name: "Pontos Removidos", value: stats.pointsRemoved, color: "hsl(var(--chart-2))" },
      { name: "Recompensas", value: stats.rewardsCollected * 10, color: "hsl(var(--chart-3))" },
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
      
      // Header
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

      // Summary Table
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Resumo", 14, 58);
      
      autoTable(doc, {
        startY: 62,
        head: [["Métrica", "Valor"]],
        body: [
          ["Pontos Distribuídos", stats.pointsAdded.toString()],
          ["Pontos Removidos", stats.pointsRemoved.toString()],
          ["Recompensas Coletadas", stats.rewardsCollected.toString()],
          ["Clientes Ativos", `${stats.activeClients} de ${clients.length}`],
          ["Total de Transações", stats.totalTransactions.toString()],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
      });

      // Transactions Table
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.text("Últimas Transações", 14, finalY + 15);
      
      const transactionRows = transactions.slice(0, 50).map(t => [
        format(new Date(t.created_at!), "dd/MM/yyyy HH:mm"),
        getTypeLabel(t.type),
        t.points.toString(),
        t.balance_after.toString(),
        t.created_by === "business" ? "Loja" : "Cliente"
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Data", "Tipo", "Pontos", "Saldo", "Por"]],
        body: transactionRows,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
      });

      // Footer
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
              <h1 className="text-2xl font-bold">Relatórios</h1>
              <p className="text-white/80 text-sm">{currentUser?.storeName}</p>
            </div>
            <FileText className="w-8 h-8 text-white/80" />
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
            
            {/* Export Buttons */}
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

        {/* Stats Cards */}
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
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <Minus className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Pontos Removidos</p>
            <AnimatedCounter 
              value={stats.pointsRemoved} 
              className="text-2xl font-bold text-foreground"
            />
          </Card>

          <Card className="p-5 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Recompensas</p>
            <AnimatedCounter 
              value={stats.rewardsCollected} 
              className="text-2xl font-bold text-foreground"
            />
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
            <p className="text-xs text-muted-foreground mt-1">
              de {clients.length} total
            </p>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Atividade - {periodLabels[period]}
          </h3>
          
          {dailyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    interval={period === "month" ? 4 : 0}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="pontos" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Pontos"
                  />
                  <Bar 
                    dataKey="recompensas" 
                    fill="hsl(var(--chart-3))" 
                    radius={[4, 4, 0, 0]}
                    name="Recompensas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Nenhuma transação no período selecionado
            </div>
          )}
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

        {/* Summary */}
        <Card className="p-6 rounded-2xl border-0 shadow-premium bg-gradient-to-br from-primary/5 to-primary/10">
          <h3 className="font-bold text-foreground mb-3">📊 Resumo do Período</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Total de transações: <strong className="text-foreground">{stats.totalTransactions}</strong></p>
            <p>• Média de pontos por transação: <strong className="text-foreground">
              {stats.totalTransactions > 0 
                ? Math.round(stats.pointsAdded / Math.max(transactions.filter(t => t.type === "points_added").length, 1))
                : 0}
            </strong></p>
            <p>• Taxa de recompensas: <strong className="text-foreground">
              {clients.length > 0 
                ? Math.round((stats.rewardsCollected / clients.length) * 100)
                : 0}%
            </strong> dos clientes</p>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BusinessReports;

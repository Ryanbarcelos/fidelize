import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

const DocumentationPDF = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      const addPage = () => {
        doc.addPage();
        y = margin;
      };

      const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - margin) {
          addPage();
        }
      };

      const addTitle = (text: string, size: number = 24) => {
        checkPageBreak(20);
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // Primary blue
        doc.text(text, pageWidth / 2, y, { align: "center" });
        y += size * 0.5;
      };

      const addSubtitle = (text: string, size: number = 16) => {
        checkPageBreak(15);
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(text, margin, y);
        y += size * 0.6;
      };

      const addText = (text: string, size: number = 11) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105); // Slate 500
        const lines = doc.splitTextToSize(text, contentWidth);
        lines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, y);
          y += 6;
        });
      };

      const addBullet = (text: string) => {
        checkPageBreak(7);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text("•", margin, y);
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        lines.forEach((line: string, index: number) => {
          doc.text(line, margin + 8, y);
          if (index < lines.length - 1) y += 6;
        });
        y += 6;
      };

      const addSpace = (space: number = 10) => {
        y += space;
      };

      const addLine = () => {
        checkPageBreak(5);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // ========== CAPA ==========
      y = 80;
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 60, "F");
      
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FIDELIZE", pageWidth / 2, 35, { align: "center" });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema de Fidelização Digital", pageWidth / 2, 48, { align: "center" });

      y = 100;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Documentação Técnica Completa", pageWidth / 2, y, { align: "center" });
      
      y = 130;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Versão 1.0", pageWidth / 2, y, { align: "center" });
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, y + 10, { align: "center" });

      // ========== PÁGINA 2 - ÍNDICE ==========
      addPage();
      addTitle("Índice", 20);
      addSpace(10);
      
      const indexItems = [
        "1. Visão Geral do Projeto",
        "2. Arquitetura do Sistema",
        "3. Tecnologias Utilizadas",
        "4. Estrutura do Banco de Dados",
        "5. Funcionalidades - Cliente",
        "6. Funcionalidades - Lojista",
        "7. Fluxos de Usuário",
        "8. Sistema de Segurança",
        "9. Sistema de Gamificação",
        "10. Telas e Componentes",
      ];
      
      indexItems.forEach((item) => {
        addText(item, 12);
        addSpace(2);
      });

      // ========== PÁGINA 3 - VISÃO GERAL ==========
      addPage();
      addTitle("1. Visão Geral", 18);
      addLine();
      
      addSubtitle("O que é o Fidelize?", 14);
      addText("O Fidelize é uma plataforma digital de fidelização de clientes que conecta empresas/lojas a seus clientes, oferecendo um sistema moderno de cartões de fidelidade, promoções automáticas e gamificação.");
      addSpace();
      
      addSubtitle("Problema que Resolve", 14);
      addBullet("Substituição de cartões físicos de fidelidade (papel/cartão)");
      addBullet("Centralização de programas de fidelidade em um único app");
      addBullet("Automação de promoções e recompensas");
      addBullet("Engajamento de clientes através de gamificação");
      addSpace();
      
      addSubtitle("Público-Alvo", 14);
      addBullet("Clientes (Consumidores): Pessoas que frequentam lojas e querem acumular pontos");
      addBullet("Empresas (Lojistas): Donos de negócios que querem fidelizar clientes");

      // ========== PÁGINA 4 - ARQUITETURA ==========
      addPage();
      addTitle("2. Arquitetura do Sistema", 18);
      addLine();
      
      addSubtitle("Camadas da Aplicação", 14);
      addBullet("Frontend: React + Vite + TypeScript");
      addBullet("Estilização: Tailwind CSS + Shadcn/UI");
      addBullet("Backend: Lovable Cloud (Supabase)");
      addBullet("Banco de Dados: PostgreSQL");
      addBullet("Autenticação: Supabase Auth");
      addBullet("Segurança: Row Level Security (RLS)");
      addSpace();
      
      addSubtitle("Padrão de Comunicação", 14);
      addText("Cliente → API REST (Supabase) → Banco de Dados PostgreSQL");
      addText("Respostas em formato JSON");

      // ========== PÁGINA 5 - TECNOLOGIAS ==========
      addPage();
      addTitle("3. Tecnologias Utilizadas", 18);
      addLine();
      
      addSubtitle("Frontend", 14);
      addBullet("React 18.3.1 - Framework de UI");
      addBullet("TypeScript - Tipagem estática");
      addBullet("Vite - Build tool rápido");
      addBullet("Tailwind CSS - Estilização utilitária");
      addBullet("Shadcn/UI - Componentes de interface");
      addBullet("React Router 6.30.1 - Navegação");
      addBullet("TanStack Query 5.83.0 - Gerenciamento de estado");
      addBullet("Recharts 2.15.4 - Gráficos");
      addBullet("Lucide React - Ícones");
      addSpace();
      
      addSubtitle("Backend (Lovable Cloud)", 14);
      addBullet("Supabase - Backend as a Service");
      addBullet("PostgreSQL - Banco de dados relacional");
      addBullet("Row Level Security (RLS) - Segurança de dados");
      addBullet("Edge Functions (Deno) - Lógica serverless");
      addSpace();
      
      addSubtitle("Bibliotecas Adicionais", 14);
      addBullet("canvas-confetti - Animações de celebração");
      addBullet("html5-qrcode - Leitura de QR Code");
      addBullet("react-qr-code - Geração de QR Code");
      addBullet("jspdf - Geração de relatórios PDF");
      addBullet("date-fns - Manipulação de datas");
      addBullet("zod - Validação de dados");

      // ========== PÁGINA 6 - BANCO DE DADOS ==========
      addPage();
      addTitle("4. Estrutura do Banco de Dados", 18);
      addLine();
      
      addSubtitle("Tabelas Principais", 14);
      addSpace(5);
      
      addText("profiles - Perfis de Usuário", 12);
      addBullet("id, user_id, name, email, account_type, store_name, cnpj, avatar_url");
      addSpace(3);
      
      addText("companies - Empresas/Lojas", 12);
      addBullet("id, owner_id, name, share_code (único), pin_secret");
      addSpace(3);
      
      addText("fidelity_cards - Cartões de Fidelidade", 12);
      addBullet("id, user_id, company_id, balance (pontos), logo");
      addSpace(3);
      
      addText("fidelity_transactions - Transações", 12);
      addBullet("id, fidelity_card_id, type (points_added/removed/reward), points, balance_after");
      addSpace(3);
      
      addText("automatic_promotions - Promoções Automáticas", 12);
      addBullet("id, company_id, title, description, points_threshold, reward_type, reward_value");
      addSpace(3);
      
      addText("earned_promotions - Promoções Conquistadas", 12);
      addBullet("id, user_id, promotion_id, is_redeemed, redemption_code");
      addSpace(3);
      
      addText("user_gamification - Gamificação", 12);
      addBullet("id, user_id, current_level, current_xp, total_rewards, medals[], current_streak");
      addSpace(3);
      
      addText("user_achievements - Conquistas", 12);
      addBullet("id, user_id, achievement_id, current, completed, completed_at");
      addSpace(3);
      
      addText("notifications - Notificações", 12);
      addBullet("id, user_id, store_id, title, description, read");

      // ========== PÁGINA 7 - FUNCIONALIDADES CLIENTE ==========
      addPage();
      addTitle("5. Funcionalidades - Cliente", 18);
      addLine();
      
      addBullet("Cadastro/Login - Autenticação por email/senha");
      addBullet("Adicionar Lojas - Via código de compartilhamento (share_code)");
      addBullet("Ver Cartões - Lista de todos os cartões de fidelidade");
      addBullet("Acumular Pontos - Através de QR Code ou código da loja");
      addBullet("Ver Promoções - Promoções disponíveis das lojas");
      addBullet("Resgatar Recompensas - Usar pontos para benefícios");
      addBullet("Histórico - Ver todas as transações");
      addBullet("Conquistas - Sistema de gamificação com medalhas");
      addBullet("Notificações - Alertas de novas promoções");
      addBullet("Perfil - Gerenciar dados pessoais");

      // ========== PÁGINA 8 - FUNCIONALIDADES LOJISTA ==========
      addPage();
      addTitle("6. Funcionalidades - Lojista", 18);
      addLine();
      
      addBullet("Dashboard - Visão geral do negócio com métricas");
      addBullet("Gerenciar Clientes - Ver e gerenciar cartões de clientes");
      addBullet("Adicionar Pontos - Via PIN de segurança (4 dígitos)");
      addBullet("Criar Promoções - Promoções automáticas baseadas em pontos");
      addBullet("Validar Resgates - Confirmar uso de recompensas");
      addBullet("Relatórios - Análise de dados e métricas");
      addBullet("Código de Compartilhamento - Para clientes adicionarem a loja");

      // ========== PÁGINA 9 - FLUXOS ==========
      addPage();
      addTitle("7. Fluxos de Usuário", 18);
      addLine();
      
      addSubtitle("Fluxo: Cliente Adiciona Loja", 14);
      addText("1. Cliente faz login no aplicativo");
      addText("2. Clica em 'Adicionar Loja'");
      addText("3. Digita o código de compartilhamento (ex: LANCHONETE1)");
      addText("4. Sistema busca a empresa pelo código");
      addText("5. Cria um novo fidelity_card vinculado");
      addText("6. Cliente vê o novo cartão na Home");
      addSpace();
      
      addSubtitle("Fluxo: Acumular Pontos", 14);
      addText("1. Cliente vai à loja física");
      addText("2. Abre o app e mostra QR Code do cartão");
      addText("3. Lojista escaneia ou digita código + PIN");
      addText("4. Sistema valida PIN e adiciona pontos");
      addText("5. Transação é registrada");
      addText("6. Se atingir threshold, ganha promoção automaticamente");
      addSpace();
      
      addSubtitle("Fluxo: Resgatar Recompensa", 14);
      addText("1. Cliente acumula pontos suficientes");
      addText("2. Sistema detecta e cria earned_promotion");
      addText("3. Cliente vê promoção disponível");
      addText("4. Vai à loja e solicita resgate");
      addText("5. Lojista valida código de resgate");
      addText("6. Promoção marcada como resgatada");

      // ========== PÁGINA 10 - SEGURANÇA ==========
      addPage();
      addTitle("8. Sistema de Segurança", 18);
      addLine();
      
      addSubtitle("Row Level Security (RLS)", 14);
      addBullet("Isolamento de dados - Usuários só veem seus próprios dados");
      addBullet("Acesso business - Lojistas acessam dados de clientes de sua empresa");
      addBullet("Funções SECURITY DEFINER - Evitam recursão infinita nas políticas");
      addSpace();
      
      addSubtitle("Funções de Segurança Implementadas", 14);
      addBullet("user_owns_company(company_uuid) - Verifica se usuário é dono da empresa");
      addBullet("user_has_card_for_company(company_uuid) - Verifica se tem cartão na empresa");
      addSpace();
      
      addSubtitle("Validação de PIN", 14);
      addBullet("PIN de 4 dígitos por empresa");
      addBullet("Validado via Edge Function");
      addBullet("Necessário para adicionar pontos");

      // ========== PÁGINA 11 - GAMIFICAÇÃO ==========
      addPage();
      addTitle("9. Sistema de Gamificação", 18);
      addLine();
      
      addSubtitle("Níveis", 14);
      addBullet("Nível 1: 0 XP");
      addBullet("Nível 2: 100 XP");
      addBullet("Nível 3: 300 XP");
      addBullet("Nível 4: 600 XP");
      addBullet("Nível 5+: Progressivo");
      addSpace();
      
      addSubtitle("Fontes de XP", 14);
      addBullet("Adicionar pontos: +10 XP");
      addBullet("Resgatar recompensa: +50 XP");
      addBullet("Completar conquista: +100 XP");
      addBullet("Streak diário: +5 XP por dia");
      addSpace();
      
      addSubtitle("Tipos de Conquistas", 14);
      addBullet("Primeiro cartão adicionado");
      addBullet("X pontos acumulados");
      addBullet("X recompensas resgatadas");
      addBullet("Streak de X dias");
      addBullet("Visitar X lojas diferentes");

      // ========== PÁGINA 12 - TELAS ==========
      addPage();
      addTitle("10. Telas e Componentes", 18);
      addLine();
      
      addSubtitle("Telas do Cliente", 14);
      addBullet("/login - Autenticação");
      addBullet("/signup - Registro de novo usuário");
      addBullet("/ - Home com lista de cartões");
      addBullet("/fidelity-card/:id - Detalhes do cartão");
      addBullet("/fidelity-card/:id/history - Histórico de transações");
      addBullet("/add-card - Adicionar loja via share code");
      addBullet("/promotions - Promoções disponíveis");
      addBullet("/earned-promotions - Recompensas para resgatar");
      addBullet("/achievements - Medalhas e conquistas");
      addBullet("/notifications - Alertas do sistema");
      addBullet("/profile - Configurações do usuário");
      addSpace();
      
      addSubtitle("Telas do Lojista", 14);
      addBullet("/business-dashboard - Painel principal");
      addBullet("/store-clients - Gerenciar clientes");
      addBullet("/automatic-promotions - Criar/editar promoções");
      addBullet("/validate-redemption - Confirmar uso de promoção");
      addBullet("/business-reports - Métricas e análises");

      // ========== PÁGINA FINAL ==========
      addPage();
      y = 80;
      addTitle("Fidelize", 28);
      y = 110;
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Sistema de Fidelização Digital", pageWidth / 2, y, { align: "center" });
      
      y = 140;
      doc.setFontSize(12);
      doc.text("Documentação Técnica v1.0", pageWidth / 2, y, { align: "center" });
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, y + 15, { align: "center" });

      // Salvar
      doc.save("Fidelize_Documentacao_Tecnica.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Gerar Documentação PDF</CardTitle>
            <p className="text-muted-foreground mt-2">
              Exporte a documentação completa do projeto Fidelize em formato PDF profissional
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">O PDF incluirá:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Visão geral do projeto
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Arquitetura do sistema
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Tecnologias utilizadas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Estrutura do banco de dados
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Funcionalidades (cliente e lojista)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Fluxos de usuário
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Sistema de segurança
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Sistema de gamificação
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Lista de telas e componentes
                </li>
              </ul>
            </div>

            <Button
              onClick={generatePDF}
              disabled={generating}
              className="w-full h-12 text-base"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Baixar Documentação PDF
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              O arquivo será baixado automaticamente após a geração
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentationPDF;

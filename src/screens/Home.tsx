import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { useAutomaticPromotions } from "@/hooks/useAutomaticPromotions";
import { usePWA } from "@/hooks/usePWA";
import { FidelityCardItem } from "@/components/cards/FidelityCardItem";
import { AddStoreModal } from "@/components/cards/AddStoreModal";
import { SearchBar } from "@/components/common/SearchBar";
import { SortSelect } from "@/components/common/SortSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Wallet, Store, Gift, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cards: fidelityCards, loading: fidelityLoading, refetchCards } = useFidelityCards();
  const { fetchEarnedPromotions } = useAutomaticPromotions();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const { level, xpProgress } = useGamification();
  const { isInstalled: isPWAInstalled } = usePWA();
  const [pendingPromotionsCount, setPendingPromotionsCount] = useState(0);

  // Fetch pending promotions count
  useEffect(() => {
    const loadPromotionCount = async () => {
      const earned = await fetchEarnedPromotions();
      setPendingPromotionsCount(earned.filter(p => !p.isRedeemed).length);
    };
    if (isAuthenticated) {
      loadPromotionCount();
    }
  }, [isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const filteredAndSortedCards = useMemo(() => {
    let filtered = fidelityCards.filter((card) =>
      (card.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.company?.name || "").localeCompare(b.company?.name || "");
      } else if (sortBy === "points") {
        return b.balance - a.balance;
      } else if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return filtered;
  }, [fidelityCards, searchQuery, sortBy]);

  if (authLoading || fidelityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Header with Level */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 shadow-premium">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-glow flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Fidelize</h1>
                <p className="text-sm text-muted-foreground">Olá, {currentUser?.name}</p>
              </div>
            </div>
            
            {/* Premium Level Display */}
            <div className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-2xl px-4 py-2.5 border border-primary/20 shadow-premium">
              <div className="w-9 h-9 rounded-full gradient-glow flex items-center justify-center">
                <span className="text-white text-sm font-bold">{level}</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">Nível {level}</p>
                <p className="text-xs text-muted-foreground">
                  {xpProgress.current}/{xpProgress.needed} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Add Store by Code Section */}
        <Card 
          onClick={() => setShowAddStoreModal(true)}
          className="p-4 mb-4 border-dashed border-2 border-primary/30 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all fade-in"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Adicionar Loja</h3>
              <p className="text-sm text-muted-foreground">Digite o código da loja para criar seu cartão</p>
            </div>
            <Plus className="w-5 h-5 text-primary" />
          </div>
        </Card>

        {/* My Promotions Section */}
        <Card 
          onClick={() => navigate("/earned-promotions")}
          className="p-4 mb-4 border-0 shadow-md rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 cursor-pointer hover:shadow-lg transition-all fade-in"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Minhas Promoções</h3>
              <p className="text-sm text-muted-foreground">
                {pendingPromotionsCount > 0 
                  ? `${pendingPromotionsCount} recompensa(s) para resgatar!` 
                  : "Veja suas recompensas conquistadas"}
              </p>
            </div>
            {pendingPromotionsCount > 0 && (
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                {pendingPromotionsCount}
              </span>
            )}
          </div>
        </Card>

        {/* Install App Card - only show if not installed as PWA */}
        {!isPWAInstalled && (
          <Card 
            onClick={() => navigate("/install")}
            className="p-4 mb-6 border-0 shadow-md rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 cursor-pointer hover:shadow-lg transition-all fade-in"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Instalar App</h3>
                <p className="text-sm text-muted-foreground">Adicione à tela inicial do seu celular</p>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-8 space-y-4 fade-in">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Meus Cartões</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {filteredAndSortedCards.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 to-primary-light/5 flex items-center justify-center mx-auto mb-8 shadow-premium">
              <Wallet className="w-14 h-14 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              {searchQuery ? "Nenhum cartão encontrado" : "Comece Agora"}
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Adicione seu primeiro cartão de fidelidade digitando o código da loja acima"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowAddStoreModal(true)}
                size="lg"
                className="rounded-2xl shadow-premium-lg hover:shadow-glow transition-all hover:scale-105 h-14 px-8 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeira Loja
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredAndSortedCards.map((card, index) => (
              <div 
                key={card.id}
                className="fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <FidelityCardItem card={card} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Store Modal */}
      <AddStoreModal
        open={showAddStoreModal}
        onOpenChange={setShowAddStoreModal}
        onSuccess={refetchCards}
      />

      <BottomNavigation />
    </div>
  );
};

export default Home;

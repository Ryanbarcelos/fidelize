import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCards } from "@/hooks/useCards";
import { useAchievements } from "@/hooks/useAchievements";
import { useGamification } from "@/hooks/useGamification";
import { useFidelityCards } from "@/hooks/useFidelityCards";
import { CardItem } from "@/components/cards/CardItem";
import { AddStoreModal } from "@/components/cards/AddStoreModal";
import { SearchBar } from "@/components/common/SearchBar";
import { SortSelect } from "@/components/common/SortSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Wallet, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cards, loading: cardsLoading } = useCards();
  const { cards: fidelityCards, loading: fidelityLoading, refetchCards } = useFidelityCards();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const { updateAchievements } = useAchievements();
  const { level, xpProgress } = useGamification();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Update achievements whenever cards change
  useEffect(() => {
    if (cards.length > 0) {
      updateAchievements();
    }
  }, [cards, updateAchievements]);

  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards.filter((card) =>
      card.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.storeName.localeCompare(b.storeName);
      } else if (sortBy === "points") {
        return b.points - a.points;
      } else if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return filtered;
  }, [cards, searchQuery, sortBy]);

  if (authLoading || cardsLoading || fidelityLoading) {
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
          className="p-4 mb-6 border-dashed border-2 border-primary/30 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all fade-in"
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

        {/* Fidelity Cards from Companies */}
        {fidelityCards.length > 0 && (
          <div className="mb-8 space-y-4 fade-in">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Cartões de Fidelidade</h2>
            <div className="grid gap-4">
              {fidelityCards.map((card, index) => (
                <Card 
                  key={card.id}
                  className="p-4 rounded-2xl shadow-premium hover:shadow-premium-lg transition-all"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-glow flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {card.company?.name?.charAt(0) || "L"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{card.company?.name || "Loja"}</h3>
                      <p className="text-sm text-muted-foreground">Código: {card.company?.shareCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{card.balance}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
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
                : "Adicione seu primeiro cartão de fidelidade e comece a acumular pontos"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate("/add-card")}
                size="lg"
                className="rounded-2xl shadow-premium-lg hover:shadow-glow transition-all hover:scale-105 h-14 px-8 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeiro Cartão
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
                <CardItem card={card} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Premium Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-20">
        <Button
          size="lg"
          onClick={() => navigate("/add-card")}
          className="rounded-full w-16 h-16 shadow-premium-lg hover:shadow-glow transition-all hover:scale-110 gradient-glow"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

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

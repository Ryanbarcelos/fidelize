import { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useAchievements } from "@/hooks/useAchievements";
import { LoyaltyCard } from "@/types/card";
import { CardItem } from "@/components/CardItem";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const { updateAchievements } = useAchievements();

  // Update achievements whenever cards change
  useEffect(() => {
    updateAchievements();
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Modern Header */}
      <header className="bg-white dark:bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95 dark:bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Fidelize</h1>
              <p className="text-xs text-muted-foreground">Olá, {currentUser?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="mb-6 space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Meus Cartões</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {filteredAndSortedCards.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {searchQuery ? "Nenhum cartão encontrado" : "Comece Agora"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Adicione seu primeiro cartão de fidelidade e comece a acumular pontos"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate("/add-card")}
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeiro Cartão
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedCards.map((card, index) => (
              <div 
                key={card.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardItem card={card} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-8 z-20">
        <Button
          size="lg"
          onClick={() => navigate("/add-card")}
          className="rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;

import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { CardItem } from "@/components/CardItem";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

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
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <h1 className="text-xl font-bold">Meus Cartões Fidelidade</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {filteredAndSortedCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhum cartão encontrado" : "Nenhum cartão cadastrado"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Adicione seu primeiro cartão fidelidade"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/add-card")}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cartão
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedCards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => navigate("/add-card")}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Home;

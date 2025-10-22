import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";

const CardDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cards, setCards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");

  const card = cards.find((c) => c.id === id);

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Cartão não encontrado</h2>
          <Button onClick={() => navigate("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setCards(cards.filter((c) => c.id !== id));
    toast.success("Cartão excluído com sucesso!");
    navigate("/");
  };

  const handleAddPoints = () => {
    if (!card) return;

    if (pinInput !== card.storePin) {
      toast.error("PIN incorreto");
      return;
    }

    const points = parseInt(pointsToAdd) || 0;
    if (points <= 0) {
      toast.error("Por favor, insira uma quantidade válida de pontos");
      return;
    }

    const updatedCards = cards.map((c) =>
      c.id === id
        ? { ...c, points: c.points + points, updatedAt: new Date().toISOString() }
        : c
    );
    setCards(updatedCards);
    toast.success(`${points} pontos adicionados com sucesso!`);
    setIsAddPointsOpen(false);
    setPinInput("");
    setPointsToAdd("");
  };

  const cardColors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-red-500 to-red-600",
  ];
  
  const colorIndex = card.id.charCodeAt(0) % cardColors.length;
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Detalhes do Cartão</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-8 animate-fade-in">
        {/* Card Display - Styled like a real card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardColors[colorIndex]} p-8 shadow-2xl mb-6 min-h-[240px]`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            {/* Logo/Initial */}
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                {card.logo ? (
                  <img src={card.logo} alt={card.storeName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold drop-shadow-md">
                    {getInitial(card.storeName)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm font-medium">Cartão Fidelidade</p>
              </div>
            </div>

            {/* Store Name */}
            <h2 className="text-white text-2xl font-bold mb-2 drop-shadow-md">{card.storeName}</h2>
            
            {/* Card Number */}
            {card.cardNumber && (
              <p className="text-white/90 text-sm font-mono mb-6 drop-shadow">
                {card.cardNumber}
              </p>
            )}

            {/* Points Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-white/80 text-sm font-medium mb-1">Saldo de Pontos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-4xl font-bold drop-shadow-md">
                  {card.points}
                </span>
                <span className="text-white/90 text-lg font-medium">
                  {card.points === 1 ? "ponto" : "pontos"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Info */}
        <Card className="p-6 mb-6 border-0 shadow-md">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Informações do Cartão</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">Cadastrado em</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(card.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {card.updatedAt !== card.createdAt && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-sm text-muted-foreground">Última atualização</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(card.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Add Points Button */}
        <div className="mb-4">
          <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Pontos
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Adicionar Pontos</DialogTitle>
                <DialogDescription>
                  Digite o PIN da loja para adicionar pontos ao cartão
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-base">PIN da Loja</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="h-14 text-lg text-center tracking-widest rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount" className="text-base">Quantidade de pontos</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    min="1"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder="Ex: 10"
                    className="h-14 text-lg rounded-2xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddPointsOpen(false);
                    setPinInput("");
                    setPointsToAdd("");
                  }}
                  className="rounded-2xl"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddPoints} className="rounded-2xl">Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/edit-card/${card.id}`)}
            variant="outline"
            className="h-14 rounded-2xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-14 rounded-2xl">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Tem certeza que deseja excluir o cartão <span className="font-semibold">"{card.storeName}"</span>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
};

export default CardDetails;

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Detalhes do Cartão</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
              {card.logo ? (
                <img src={card.logo} alt={card.storeName} className="w-full h-full object-cover" />
              ) : (
                <CreditCard className="w-12 h-12 text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{card.storeName}</h2>
            <p className="text-3xl font-bold text-primary mt-2">
              {card.points} {card.points === 1 ? "ponto" : "pontos"}
            </p>
          </div>

          <div className="space-y-4">
            {card.cardNumber && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Número do Cartão</p>
                <p className="font-mono text-foreground">{card.cardNumber}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-1">Cadastrado em</p>
              <p className="text-foreground">
                {new Date(card.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {card.updatedAt !== card.createdAt && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Última atualização</p>
                <p className="text-foreground">
                  {new Date(card.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="mb-4">
          <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pontos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Pontos</DialogTitle>
                <DialogDescription>
                  Digite o PIN da loja para adicionar pontos ao cartão
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN da Loja (4 dígitos)</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount">Quantidade de pontos a adicionar</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    min="1"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddPointsOpen(false);
                    setPinInput("");
                    setPointsToAdd("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddPoints}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/edit-card/${card.id}`)}
            className="flex-1"
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o cartão "{card.storeName}"? Esta ação não pode
                  ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
};

export default CardDetails;

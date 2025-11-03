import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { Promotion } from "@/types/promotion";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Megaphone, Plus, Calendar, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Promotions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  const [promotions, setPromotions] = useLocalStorage<Promotion[]>("promotions", []);
  const { addNotification } = useNotifications();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== "business") {
      navigate("/business-dashboard");
    }
  }, [currentUser, navigate]);

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleCreatePromotion = () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("A data de término deve ser posterior à data de início");
      return;
    }

    const newPromotion: Promotion = {
      id: Date.now().toString(),
      storeId: currentUser?.email || "",
      storeName: currentUser?.storeName || "",
      title,
      description,
      startDate,
      endDate,
      imageUrl: imageUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save promotion
    setPromotions((prev) => [newPromotion, ...prev]);

    // Send notification to all customers who have this store's card
    const storeCustomers = cards.filter(
      (card) => card.storeName === currentUser?.storeName
    );

    storeCustomers.forEach(() => {
      addNotification({
        promotionId: newPromotion.id,
        storeId: newPromotion.storeId,
        storeName: newPromotion.storeName,
        title: newPromotion.title,
        description: newPromotion.description,
        imageUrl: newPromotion.imageUrl,
      });
    });

    triggerConfetti();
    toast.success(`Promoção criada e enviada para ${storeCustomers.length} ${storeCustomers.length === 1 ? 'cliente' : 'clientes'}! 🎉`);

    // Reset form
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setImageUrl("");
    setShowCreateDialog(false);
  };

  const myPromotions = promotions.filter(
    (promo) => promo.storeName === currentUser?.storeName
  );

  if (!currentUser || currentUser.accountType !== "business") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/business-dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Promoções da Loja</h1>
                  <p className="text-sm text-muted-foreground">{currentUser.storeName}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Promoção
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {myPromotions.length === 0 ? (
          <Card className="p-8 text-center border-0 shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma promoção criada ainda
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie promoções para atrair e engajar seus clientes.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Promoção
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {myPromotions.map((promotion) => (
              <Card key={promotion.id} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {promotion.imageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={promotion.imageUrl}
                        alt={promotion.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {promotion.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {promotion.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(promotion.startDate), "dd/MM/yyyy", { locale: ptBR })}
                          {" - "}
                          {format(new Date(promotion.endDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Promotion Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Criar Nova Promoção</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da promoção que será enviada aos seus clientes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Título da Promoção *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 20% de desconto em todos os produtos"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Descrição *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da promoção..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base">
                  Data de Início *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base">
                  Data de Término *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                URL da Imagem (opcional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreatePromotion} className="rounded-xl">
              <Megaphone className="w-4 h-4 mr-2" />
              Criar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotions;

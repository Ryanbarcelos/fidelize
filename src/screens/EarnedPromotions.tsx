import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAutomaticPromotions, EarnedPromotion } from "@/hooks/useAutomaticPromotions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  ArrowLeft,
  Gift,
  Percent,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";

const REWARD_ICONS: Record<string, any> = {
  discount: Percent,
  free_item: Gift,
  bonus_points: Star,
};

const EarnedPromotions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchEarnedPromotions, redeemPromotion } = useAutomaticPromotions();
  const [earnedPromotions, setEarnedPromotions] = useState<EarnedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<EarnedPromotion | null>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, [user]);

  const loadPromotions = async () => {
    setLoading(true);
    const promotions = await fetchEarnedPromotions();
    setEarnedPromotions(promotions);
    setLoading(false);
  };

  const openRedeemDialog = (promotion: EarnedPromotion) => {
    setSelectedPromotion(promotion);
    setShowRedeemDialog(true);
  };

  const handleRedeem = async () => {
    if (!selectedPromotion) return;

    setIsRedeeming(true);
    const result = await redeemPromotion(selectedPromotion.id);

    if (result.success) {
      toast.success("Promoção resgatada com sucesso! Mostre esta tela para o atendente.", {
        duration: 5000,
      });
      setShowRedeemDialog(false);
      await loadPromotions();
    } else {
      toast.error(result.error || "Erro ao resgatar promoção");
    }

    setIsRedeeming(false);
  };

  const pendingPromotions = earnedPromotions.filter((p) => !p.isRedeemed);
  const redeemedPromotions = earnedPromotions.filter((p) => p.isRedeemed);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando suas promoções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Minhas Promoções</h1>
              <p className="text-white/80 text-sm">Recompensas conquistadas</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="p-4 bg-white/20 backdrop-blur border-0 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-white/80">Disponíveis</span>
              </div>
              <p className="text-3xl font-bold text-white">{pendingPromotions.length}</p>
            </Card>
            <Card className="p-4 bg-white/20 backdrop-blur border-0 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-sm text-white/80">Resgatadas</span>
              </div>
              <p className="text-3xl font-bold text-white">{redeemedPromotions.length}</p>
            </Card>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Pending Promotions */}
        {pendingPromotions.length > 0 && (
          <section className="mb-8">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Prontas para Resgatar
            </h2>
            <div className="space-y-4">
              {pendingPromotions.map((ep, index) => {
                const Icon = REWARD_ICONS[ep.promotion?.rewardType || "discount"] || Gift;
                return (
                  <Card
                    key={ep.id}
                    className="p-4 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 overflow-hidden relative"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -mr-12 -mt-12" />
                    
                    <div className="flex items-start gap-4 relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-lg mb-1">
                          {ep.promotion?.title}
                        </h3>
                        {ep.promotion?.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {ep.promotion.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
                            <Star className="w-3 h-3" />
                            {ep.promotion?.rewardValue}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ep.earnedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => openRedeemDialog(ep)}
                      className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
                    >
                      <PartyPopper className="w-5 h-5 mr-2" />
                      Resgatar Agora
                    </Button>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {pendingPromotions.length === 0 && redeemedPromotions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Nenhuma promoção ainda
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Continue acumulando pontos para ganhar recompensas exclusivas das suas lojas favoritas!
            </p>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              Ver Meus Cartões
            </Button>
          </div>
        )}

        {/* Redeemed Promotions */}
        {redeemedPromotions.length > 0 && (
          <section>
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Já Resgatadas
            </h2>
            <div className="space-y-3">
              {redeemedPromotions.map((ep, index) => {
                const Icon = REWARD_ICONS[ep.promotion?.rewardType || "discount"] || Gift;
                return (
                  <Card
                    key={ep.id}
                    className="p-4 border-0 shadow-md rounded-2xl bg-muted/30 opacity-70"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {ep.promotion?.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ep.promotion?.rewardValue}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Resgatada em {new Date(ep.redeemedAt!).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Redeem Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-amber-500" />
              Resgatar Promoção
            </DialogTitle>
            <DialogDescription>
              Mostre esta tela para o atendente confirmar o resgate
            </DialogDescription>
          </DialogHeader>

          {selectedPromotion && (
            <div className="py-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {(() => {
                    const Icon = REWARD_ICONS[selectedPromotion.promotion?.rewardType || "discount"] || Gift;
                    return <Icon className="w-10 h-10 text-white" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {selectedPromotion.promotion?.title}
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  {selectedPromotion.promotion?.rewardValue}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Conquistada em</p>
                <p className="font-semibold text-foreground">
                  {new Date(selectedPromotion.earnedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isRedeeming ? "Resgatando..." : "Confirmar Resgate"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRedeemDialog(false)}
              className="w-full rounded-xl"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default EarnedPromotions;

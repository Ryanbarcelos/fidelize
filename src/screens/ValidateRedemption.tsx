import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { QRScanner } from "@/components/cards/QRScanner";
import {
  ArrowLeft,
  ScanLine,
  Keyboard,
  CheckCircle,
  Gift,
  Percent,
  Star,
  User,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface RedemptionData {
  id: string;
  redemptionCode: string;
  userName?: string;
  userEmail?: string;
  promotionTitle: string;
  promotionRewardValue: string;
  promotionRewardType: string;
  earnedAt: string;
}

const REWARD_ICONS: Record<string, any> = {
  discount: Percent,
  free_item: Gift,
  bonus_points: Star,
};

const ValidateRedemption = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { company } = useCompanies();
  const [showScanner, setShowScanner] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redemptionData, setRedemptionData] = useState<RedemptionData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validateCode = async (code: string) => {
    if (!company) {
      toast.error("Empresa não encontrada");
      return;
    }

    setLoading(true);
    try {
      // Find the pending redemption with this code
      const { data, error } = await supabase
        .from("earned_promotions")
        .select(`
          id,
          redemption_code,
          user_id,
          earned_at,
          automatic_promotions (
            id,
            company_id,
            title,
            reward_value,
            reward_type
          )
        `)
        .eq("redemption_code", code.toUpperCase())
        .eq("pending_redemption", true)
        .eq("is_redeemed", false)
        .single();

      if (error || !data) {
        toast.error("Código inválido ou já utilizado");
        setLoading(false);
        return;
      }

      // Verify it belongs to this company
      if ((data as any).automatic_promotions?.company_id !== company.id) {
        toast.error("Este código não pertence à sua empresa");
        setLoading(false);
        return;
      }

      // Get user info
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", data.user_id)
        .single();

      setRedemptionData({
        id: data.id,
        redemptionCode: data.redemption_code!,
        userName: profile?.name,
        userEmail: profile?.email,
        promotionTitle: (data as any).automatic_promotions?.title || "",
        promotionRewardValue: (data as any).automatic_promotions?.reward_value || "",
        promotionRewardType: (data as any).automatic_promotions?.reward_type || "discount",
        earnedAt: data.earned_at || "",
      });

      setShowScanner(false);
      setShowPinInput(false);
      setShowConfirmDialog(true);
    } catch (err) {
      console.error("Error validating code:", err);
      toast.error("Erro ao validar código");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data: string) => {
    setShowScanner(false);
    validateCode(data);
  };

  const handlePinSubmit = () => {
    if (pinCode.length !== 6) {
      toast.error("Código deve ter 6 caracteres");
      return;
    }
    validateCode(pinCode);
    setPinCode("");
    setShowPinInput(false);
  };

  const confirmRedemption = async () => {
    if (!redemptionData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("earned_promotions")
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
          pending_redemption: false,
        })
        .eq("id", redemptionData.id);

      if (error) throw error;

      toast.success("Promoção validada com sucesso!");
      setShowConfirmDialog(false);
      setRedemptionData(null);
    } catch (err) {
      console.error("Error confirming redemption:", err);
      toast.error("Erro ao confirmar resgate");
    } finally {
      setLoading(false);
    }
  };

  const Icon = redemptionData ? REWARD_ICONS[redemptionData.promotionRewardType] || Gift : Gift;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/business-dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Validar Resgate</h1>
              <p className="text-white/80 text-sm">Confirme o resgate de promoções</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Instructions */}
        <Card className="p-6 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Como validar um resgate
            </h2>
            <p className="text-sm text-muted-foreground">
              Peça ao cliente para mostrar o QR Code ou o código de 6 dígitos do resgate pendente
            </p>
          </div>
        </Card>

        {/* Scan Options */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="p-6 border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
            onClick={() => setShowScanner(true)}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ScanLine className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Escanear QR</h3>
              <p className="text-xs text-muted-foreground">Use a câmera</p>
            </div>
          </Card>

          <Card
            className="p-6 border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
            onClick={() => setShowPinInput(true)}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Keyboard className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Digitar Código</h3>
              <p className="text-xs text-muted-foreground">6 caracteres</p>
            </div>
          </Card>
        </div>

        {/* Recent validations placeholder */}
        <Card className="p-6 border-0 shadow-md rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Dica</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            O cliente gera o código de resgate no app. Após você validar aqui, 
            a promoção será marcada como utilizada automaticamente.
          </p>
        </Card>
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* PIN Input Dialog */}
      <Dialog open={showPinInput} onOpenChange={setShowPinInput}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-purple-500" />
              Digite o Código
            </DialogTitle>
            <DialogDescription>
              Insira o código de 6 caracteres mostrado pelo cliente
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Input
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="EX: ABC123"
              className="text-center text-2xl font-mono tracking-[0.3em] h-14 rounded-xl"
              autoFocus
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handlePinSubmit}
              disabled={pinCode.length !== 6 || loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {loading ? "Validando..." : "Validar Código"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPinInput(false);
                setPinCode("");
              }}
              className="w-full rounded-xl"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Confirmar Resgate
            </DialogTitle>
            <DialogDescription>
              Verifique os dados antes de confirmar
            </DialogDescription>
          </DialogHeader>

          {redemptionData && (
            <div className="py-4 space-y-4">
              {/* Client Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {redemptionData.userName || "Cliente"}
                  </p>
                  {redemptionData.userEmail && (
                    <p className="text-sm text-muted-foreground">{redemptionData.userEmail}</p>
                  )}
                </div>
              </div>

              {/* Promotion Info */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {redemptionData.promotionTitle}
                </h3>
                <p className="text-xl font-bold text-green-600">
                  {redemptionData.promotionRewardValue}
                </p>
              </div>

              {/* Code */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                  {redemptionData.redemptionCode}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={confirmRedemption}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {loading ? "Confirmando..." : "Confirmar Resgate"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setRedemptionData(null);
              }}
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

export default ValidateRedemption;
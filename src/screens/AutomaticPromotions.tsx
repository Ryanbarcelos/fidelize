import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutomaticPromotions, AutomaticPromotion } from "@/hooks/useAutomaticPromotions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Gift,
  Percent,
  Star,
  Trash2,
  Edit,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const REWARD_TYPES = [
  { value: "discount", label: "Desconto", icon: Percent },
  { value: "free_item", label: "Item Grátis", icon: Gift },
  { value: "bonus_points", label: "Pontos Bônus", icon: Star },
];

const AutomaticPromotions = () => {
  const navigate = useNavigate();
  const { promotions, loading, createPromotion, updatePromotion, deletePromotion } = useAutomaticPromotions();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<AutomaticPromotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    pointsThreshold: "",
    rewardType: "discount",
    rewardValue: "",
    title: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      pointsThreshold: "",
      rewardType: "discount",
      rewardValue: "",
      title: "",
      description: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingPromotion(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (promotion: AutomaticPromotion) => {
    setFormData({
      pointsThreshold: promotion.pointsThreshold.toString(),
      rewardType: promotion.rewardType,
      rewardValue: promotion.rewardValue,
      title: promotion.title,
      description: promotion.description || "",
    });
    setEditingPromotion(promotion);
    setShowCreateDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.pointsThreshold || !formData.rewardValue) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPromotion) {
        const result = await updatePromotion(editingPromotion.id, {
          pointsThreshold: parseInt(formData.pointsThreshold),
          rewardType: formData.rewardType,
          rewardValue: formData.rewardValue,
          title: formData.title,
          description: formData.description,
        });

        if (result.success) {
          toast.success("Promoção atualizada!");
          setShowCreateDialog(false);
        } else {
          toast.error(result.error || "Erro ao atualizar");
        }
      } else {
        const result = await createPromotion({
          pointsThreshold: parseInt(formData.pointsThreshold),
          rewardType: formData.rewardType,
          rewardValue: formData.rewardValue,
          title: formData.title,
          description: formData.description,
        });

        if (result.success) {
          toast.success("Promoção criada!");
          setShowCreateDialog(false);
        } else {
          toast.error(result.error || "Erro ao criar");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return;

    const result = await deletePromotion(promotionId);
    if (result.success) {
      toast.success("Promoção excluída!");
    } else {
      toast.error(result.error || "Erro ao excluir");
    }
  };

  const handleToggleActive = async (promotion: AutomaticPromotion) => {
    const result = await updatePromotion(promotion.id, {
      isActive: !promotion.isActive,
    });

    if (result.success) {
      toast.success(promotion.isActive ? "Promoção desativada" : "Promoção ativada");
    } else {
      toast.error(result.error || "Erro ao atualizar");
    }
  };

  const getRewardIcon = (type: string) => {
    const reward = REWARD_TYPES.find((r) => r.value === type);
    return reward?.icon || Gift;
  };

  const getRewardLabel = (type: string) => {
    const reward = REWARD_TYPES.find((r) => r.value === type);
    return reward?.label || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando promoções...</p>
        </div>
      </div>
    );
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
                className="text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Promoções Automáticas</h1>
                <p className="text-sm text-muted-foreground">Defina recompensas por pontos</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Nova Promoção
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Info Card */}
        <Card className="p-4 mb-6 border-0 shadow-md rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Como funciona?</h3>
              <p className="text-sm text-muted-foreground">
                Configure promoções que serão automaticamente concedidas aos clientes quando 
                atingirem determinada quantidade de pontos. O cliente será notificado e poderá 
                resgatar a recompensa.
              </p>
            </div>
          </div>
        </Card>

        {/* Promotions List */}
        {promotions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nenhuma promoção</h2>
            <p className="text-muted-foreground mb-6">
              Crie promoções automáticas para recompensar seus clientes
            </p>
            <Button onClick={openCreateDialog} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Promoção
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => {
              const Icon = getRewardIcon(promotion.rewardType);
              
              return (
                <Card
                  key={promotion.id}
                  className={`p-4 border-0 shadow-md rounded-2xl transition-all ${
                    promotion.isActive
                      ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                      : "bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        promotion.isActive
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : "bg-muted"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${promotion.isActive ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{promotion.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          promotion.isActive
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {promotion.isActive ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      
                      {promotion.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {promotion.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <Star className="w-4 h-4" />
                          {promotion.pointsThreshold} pontos
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {getRewardLabel(promotion.rewardType)}: {promotion.rewardValue}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Switch
                        checked={promotion.isActive}
                        onCheckedChange={() => handleToggleActive(promotion)}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(promotion)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(promotion.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Editar Promoção" : "Nova Promoção Automática"}
            </DialogTitle>
            <DialogDescription>
              Configure uma recompensa que será concedida automaticamente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Título da Promoção *</Label>
              <Input
                id="title"
                placeholder="Ex: Desconto de Aniversário"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="pointsThreshold">Pontos Necessários *</Label>
              <Input
                id="pointsThreshold"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={formData.pointsThreshold}
                onChange={(e) => setFormData({ ...formData, pointsThreshold: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="rewardType">Tipo de Recompensa *</Label>
              <Select
                value={formData.rewardType}
                onValueChange={(value) => setFormData({ ...formData, rewardType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rewardValue">Valor da Recompensa *</Label>
              <Input
                id="rewardValue"
                placeholder={
                  formData.rewardType === "discount"
                    ? "Ex: 10% ou R$ 5,00"
                    : formData.rewardType === "free_item"
                    ? "Ex: Café grátis"
                    : "Ex: 5 pontos"
                }
                value={formData.rewardValue}
                onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da promoção..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
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
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? "Salvando..." : editingPromotion ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomaticPromotions;

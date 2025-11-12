import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePromotions } from "@/hooks/usePromotions";
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
import { ArrowLeft, Plus, Megaphone, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Promotion } from "@/types/promotion";

const StorePromotions = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { promotions, loading: promotionsLoading, addPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.accountType !== 'business')) {
      navigate("/login");
    }
  }, [authLoading, currentUser, navigate]);

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        title: promotion.title,
        description: promotion.description,
        startDate: new Date(promotion.startDate).toISOString().split('T')[0],
        endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate < startDate) {
      toast.error("A data final deve ser posterior à data inicial");
      return;
    }

    if (editingPromotion) {
      // Update existing promotion
      const result = await updatePromotion(editingPromotion.id, {
        title: formData.title,
        description: formData.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      if (result?.success) {
        toast.success("Promoção atualizada com sucesso!");
      } else {
        toast.error("Erro ao atualizar promoção");
        return;
      }
    } else {
      // Create new promotion
      const result = await addPromotion(
        formData.title,
        formData.description,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      if (result?.success) {
        toast.success("Promoção criada com sucesso!");
      } else {
        toast.error("Erro ao criar promoção");
        return;
      }
    }

    setIsDialogOpen(false);
    setEditingPromotion(null);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDelete = async (id: string) => {
    const result = await deletePromotion(id);
    if (result?.success) {
      toast.success("Promoção removida com sucesso!");
    } else {
      toast.error("Erro ao remover promoção");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end && promotion.isActive;
  };

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
              <h1 className="text-xl font-bold text-foreground">Promoções</h1>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              size="icon"
              className="rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {promotions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Nenhuma promoção ainda
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Crie promoções para engajar seus clientes e aumentar as visitas!
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              size="lg"
              className="rounded-full shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeira Promoção
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion, index) => {
              const active = isPromotionActive(promotion);
              
              return (
                <Card
                  key={promotion.id}
                  className={`p-5 border-0 shadow-md rounded-3xl ${
                    active ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      active 
                        ? "bg-gradient-to-br from-green-500 to-green-600" 
                        : "bg-gradient-to-br from-muted to-muted/80"
                    }`}>
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-foreground text-lg">
                          {promotion.title}
                        </h3>
                        {active && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex-shrink-0">
                            Ativa
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {promotion.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(promotion)}
                          className="rounded-xl"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(promotion.id)}
                          className="rounded-xl"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
            </DialogTitle>
            <DialogDescription>
              Crie promoções para engajar seus clientes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Promoção</Label>
              <Input
                id="title"
                placeholder="Ex: Desconto de 20% em cafés"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 rounded-2xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da promoção..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-2xl min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-2xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="rounded-2xl">
              {editingPromotion ? "Salvar Alterações" : "Criar Promoção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorePromotions;

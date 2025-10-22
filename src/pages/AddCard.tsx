import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LoyaltyCard } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

const AddCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cards, setCards] = useLocalStorage<LoyaltyCard[]>("loyalty-cards", []);
  
  const existingCard = id ? cards.find((c) => c.id === id) : null;
  
  const [storeName, setStoreName] = useState(existingCard?.storeName || "");
  const [cardNumber, setCardNumber] = useState(existingCard?.cardNumber || "");
  const [points, setPoints] = useState(existingCard?.points.toString() || "0");
  const [storePin, setStorePin] = useState(existingCard?.storePin || "");
  const [logo, setLogo] = useState(existingCard?.logo || "");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeName.trim()) {
      toast.error("Por favor, preencha o nome da loja");
      return;
    }

    if (!storePin || storePin.length !== 4 || !/^\d{4}$/.test(storePin)) {
      toast.error("Por favor, insira um PIN de 4 dígitos");
      return;
    }

    const newCard: LoyaltyCard = {
      id: id || Date.now().toString(),
      storeName: storeName.trim(),
      cardNumber: cardNumber.trim(),
      points: parseInt(points) || 0,
      storePin: storePin,
      logo: logo || undefined,
      createdAt: existingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingCard) {
      setCards(cards.map((c) => (c.id === id ? newCard : c)));
      toast.success("Cartão atualizado com sucesso!");
    } else {
      setCards([...cards, newCard]);
      toast.success("Cartão adicionado com sucesso!");
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {existingCard ? "Editar Cartão" : "Adicionar Cartão"}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Supermercado Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Ex: 1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePin">PIN da Loja (4 dígitos) *</Label>
              <Input
                id="storePin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={storePin}
                onChange={(e) => setStorePin(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo / Foto do Cartão</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("logo")?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logo ? "Alterar Imagem" : "Adicionar Imagem"}
                </Button>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {logo && (
                <div className="mt-3">
                  <img
                    src={logo}
                    alt="Preview"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {existingCard ? "Salvar Alterações" : "Adicionar Cartão"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AddCard;

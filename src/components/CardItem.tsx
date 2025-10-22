import { LoyaltyCard } from "@/types/card";
import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CardItemProps {
  card: LoyaltyCard;
}

export const CardItem = ({ card }: CardItemProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/card/${card.id}`)}
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {card.logo ? (
            <img src={card.logo} alt={card.storeName} className="w-full h-full object-cover" />
          ) : (
            <CreditCard className="w-7 h-7 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">{card.storeName}</h3>
          <p className="text-sm text-muted-foreground">
            {card.points} {card.points === 1 ? "ponto" : "pontos"}
          </p>
        </div>
      </div>
    </Card>
  );
};

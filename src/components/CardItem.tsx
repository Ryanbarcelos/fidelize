import { LoyaltyCard } from "@/types/card";
import { useNavigate } from "react-router-dom";

interface CardItemProps {
  card: LoyaltyCard;
}

export const CardItem = ({ card }: CardItemProps) => {
  const navigate = useNavigate();

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  
  const cardColors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-red-500 to-red-600",
  ];
  
  const colorIndex = card.id.charCodeAt(0) % cardColors.length;

  return (
    <div
      onClick={() => navigate(`/card/${card.id}`)}
      className="cursor-pointer group animate-fade-in"
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardColors[colorIndex]} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[140px]`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-xl mb-2 truncate drop-shadow-md">
              {card.storeName}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-3xl font-bold drop-shadow-md">
                {card.points}
              </span>
              <span className="text-white/90 text-sm font-medium">
                {card.points === 1 ? "ponto" : "pontos"}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 ml-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
              {card.logo ? (
                <img 
                  src={card.logo} 
                  alt={card.storeName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white text-2xl font-bold drop-shadow-md">
                  {getInitial(card.storeName)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { LoyaltyCard } from "@/types/card";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/ProgressBar";

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
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardColors[colorIndex]} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[180px]`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xl truncate drop-shadow-md">
                {card.storeName}
              </h3>
            </div>

            <div className="flex-shrink-0 ml-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                {card.logo ? (
                  <img 
                    src={card.logo} 
                    alt={card.storeName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-xl font-bold drop-shadow-md">
                    {getInitial(card.storeName)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Points Display with Progress */}
          <div className="mt-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-white/80 text-xs font-medium mb-1">Saldo</p>
                  <p className="text-white text-3xl font-bold drop-shadow-md">
                    {card.points}
                    <span className="text-lg text-white/90 ml-1">
                      {card.points === 1 ? "ponto" : "pontos"}
                    </span>
                  </p>
                </div>
                {card.points >= 10 && (
                  <div className="bg-success/20 backdrop-blur-sm rounded-xl px-3 py-1 border border-success/30 animate-pulse">
                    <span className="text-white text-xs font-medium">
                      ✓ Completo
                    </span>
                  </div>
                )}
              </div>
              <ProgressBar 
                current={Math.min(card.points, 10)} 
                max={10} 
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { LoyaltyCard } from "@/types/card";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/gamification/ProgressBar";

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
      className="cursor-pointer group"
    >
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardColors[colorIndex]} p-6 shadow-premium-lg hover:shadow-glow transition-all duration-500 hover:scale-[1.03] min-h-[200px]`}>
        {/* Premium background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        </div>

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-2xl truncate drop-shadow-lg tracking-tight">
                {card.storeName}
              </h3>
            </div>

            <div className="flex-shrink-0 ml-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/40 shadow-lg">
                {card.logo ? (
                  <img 
                    src={card.logo} 
                    alt={card.storeName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-2xl font-bold drop-shadow-lg">
                    {getInitial(card.storeName)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Premium Points Display with Progress */}
          <div className="mt-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-3xl px-5 py-4 border border-white/30 space-y-3 shadow-lg">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-white/90 text-sm font-semibold mb-1">Saldo Atual</p>
                  <p className="text-white text-4xl font-bold drop-shadow-lg tracking-tight">
                    {card.points}
                    <span className="text-xl text-white/90 ml-2 font-medium">
                      {card.points === 1 ? "ponto" : "pontos"}
                    </span>
                  </p>
                </div>
                {card.points >= 10 && (
                  <div className="bg-success/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-success/50 shadow-lg pulse-soft">
                    <span className="text-white text-sm font-bold drop-shadow-md">
                      ✓ Completo
                    </span>
                  </div>
                )}
              </div>
              <ProgressBar 
                current={Math.min(card.points, 10)} 
                max={10} 
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

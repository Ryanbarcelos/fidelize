export type TransactionType = "points_added" | "points_removed" | "reward_collected";

export interface Transaction {
  id: string;
  cardId: string;
  type: TransactionType;
  points: number;
  storeName: string;
  userName?: string;
  timestamp: string;
}

export const getTransactionLabel = (type: TransactionType): string => {
  switch (type) {
    case "points_added":
      return "Pontos adicionados";
    case "points_removed":
      return "Pontos removidos";
    case "reward_collected":
      return "Recompensa coletada";
  }
};

export const getTransactionIcon = (type: TransactionType): string => {
  switch (type) {
    case "points_added":
      return "plus";
    case "points_removed":
      return "minus";
    case "reward_collected":
      return "gift";
  }
};

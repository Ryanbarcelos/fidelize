import { LoyaltyCard } from "@/types/card";

/**
 * Serviço de manipulação de cartões de fidelidade
 * Centraliza toda lógica de negócio relacionada a cartões
 */
export class CardService {
  /**
   * Adiciona pontos a um cartão
   */
  static addPoints(
    card: LoyaltyCard,
    pointsToAdd: number
  ): { updatedCard: LoyaltyCard; transaction: any } {
    const newPoints = card.points + pointsToAdd;
    
    const transaction = {
      id: Date.now().toString(),
      cardId: card.id,
      type: "points_added" as const,
      points: pointsToAdd,
      storeName: card.storeName,
      timestamp: new Date().toISOString(),
    };

    const updatedCard: LoyaltyCard = {
      ...card,
      points: newPoints,
      updatedAt: new Date().toISOString(),
      transactions: [...(card.transactions || []), transaction],
    };

    return { updatedCard, transaction };
  }

  /**
   * Verifica se cartão está completo (10 pontos)
   */
  static isCardComplete(card: LoyaltyCard): boolean {
    return card.points >= 10;
  }

  /**
   * Verifica se cartão acabou de completar (passou de <10 para >=10)
   */
  static justCompleted(previousPoints: number, newPoints: number): boolean {
    return newPoints >= 10 && previousPoints < 10;
  }

  /**
   * Reseta pontos do cartão após coletar recompensa
   */
  static collectReward(card: LoyaltyCard): { updatedCard: LoyaltyCard; transaction: any } {
    const transaction = {
      id: Date.now().toString(),
      cardId: card.id,
      type: "reward_collected" as const,
      points: 10,
      storeName: card.storeName,
      timestamp: new Date().toISOString(),
    };

    const updatedCard: LoyaltyCard = {
      ...card,
      points: 0,
      updatedAt: new Date().toISOString(),
      transactions: [...(card.transactions || []), transaction],
    };

    return { updatedCard, transaction };
  }

  /**
   * Valida quantidade de pontos a adicionar
   */
  static validatePointsAmount(pointsStr: string): {
    valid: boolean;
    points: number;
    error?: string;
  } {
    const points = parseInt(pointsStr) || 0;
    
    if (points <= 0) {
      return {
        valid: false,
        points: 0,
        error: "Por favor, insira uma quantidade válida de pontos",
      };
    }

    return { valid: true, points };
  }

  /**
   * Obtém inicial do nome da loja
   */
  static getStoreInitial(storeName: string): string {
    return storeName.charAt(0).toUpperCase();
  }

  /**
   * Calcula progresso do cartão (0-100%)
   */
  static getProgress(card: LoyaltyCard): number {
    return Math.min((card.points / 10) * 100, 100);
  }
}

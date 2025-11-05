/**
 * Paleta de cores oficial do Fidelize
 * Mantém todas as cores em HSL para compatibilidade com Tailwind
 */
export const colors = {
  primary: {
    DEFAULT: '#2563EB',
    light: '#60A5FA',
    dark: '#1E40AF',
  },
  secondary: {
    DEFAULT: '#60A5FA',
    light: '#93C5FD',
  },
  background: {
    DEFAULT: '#F9FAFB',
    card: '#FFFFFF',
  },
  gradient: {
    primary: 'from-primary to-primary-light',
    card: {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
    },
  },
} as const;

/**
 * Retorna uma cor de gradiente de cartão baseada em um ID
 */
export const getCardGradient = (cardId: string): string => {
  const gradients = [
    colors.gradient.card.blue,
    colors.gradient.card.purple,
    colors.gradient.card.pink,
    colors.gradient.card.green,
    colors.gradient.card.orange,
    colors.gradient.card.red,
  ];
  
  const index = cardId.charCodeAt(0) % gradients.length;
  return gradients[index];
};

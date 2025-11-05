# Estrutura do Projeto Fidelize

Este documento descreve a organização do código do app Fidelize após a refatoração.

## 📁 Estrutura de Pastas

```
src/
├── screens/              # Telas da aplicação (antigas pages)
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── Achievements.tsx
│   ├── CardDetails.tsx
│   ├── AddCard.tsx
│   ├── TransactionHistory.tsx
│   ├── NearbyStores.tsx
│   ├── Notifications.tsx
│   ├── Promotions.tsx
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── BusinessDashboard.tsx
│   ├── StorePanel.tsx
│   ├── StoreClients.tsx
│   └── StorePromotions.tsx
│
├── components/
│   ├── cards/           # Componentes relacionados a cartões
│   │   ├── CardItem.tsx
│   │   ├── QRCodeDisplay.tsx
│   │   └── QRScanner.tsx
│   │
│   ├── gamification/    # Componentes de gamificação
│   │   ├── ProgressBar.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── MedalDisplay.tsx
│   │   ├── CelebrationDialog.tsx
│   │   ├── AnimatedCounter.tsx
│   │   └── AchievementCard.tsx
│   │
│   ├── common/          # Componentes reutilizáveis
│   │   ├── SearchBar.tsx
│   │   ├── SortSelect.tsx
│   │   └── NearbyStoreCard.tsx
│   │
│   ├── layout/          # Componentes de layout
│   │   └── BottomNavigation.tsx
│   │
│   └── ui/              # Componentes Shadcn/UI
│       └── (vários componentes)
│
├── services/            # Lógica de negócio
│   ├── cardService.ts   # Manipulação de cartões
│   ├── pinService.ts    # Validação de PIN
│   ├── confettiService.ts # Animações de celebração
│   └── index.ts
│
├── hooks/               # Hooks customizados
│   ├── useAuth.ts
│   ├── useAchievements.ts
│   ├── useGamification.ts
│   ├── useLocalStorage.ts
│   ├── useLocation.ts
│   ├── useNotifications.ts
│   └── use-toast.ts
│
├── theme/               # Tema global
│   ├── colors.ts        # Paleta de cores
│   ├── typography.ts    # Tipografia
│   ├── spacing.ts       # Espaçamentos e sombras
│   └── index.ts
│
├── types/               # TypeScript types
│   ├── card.ts
│   ├── store.ts
│   ├── achievement.ts
│   ├── promotion.ts
│   └── transaction.ts
│
├── lib/                 # Utilitários
│   └── utils.ts
│
├── integrations/        # Integrações externas
│   └── supabase/
│
├── App.tsx              # Componente raiz
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## 🎨 Theme System

O tema é centralizado em `src/theme/`:

### Cores (`colors.ts`)
```typescript
import { colors, getCardGradient } from '@/theme';

// Usar cores do tema
colors.primary.DEFAULT // '#2563EB'
colors.primary.light   // '#60A5FA'

// Obter gradiente de cartão
getCardGradient(cardId) // Retorna classe Tailwind
```

### Tipografia (`typography.ts`)
```typescript
import { typography } from '@/theme';

typography.fontFamily.primary // 'Inter, system-ui, ...'
typography.fontSize.xl         // '1.25rem'
typography.fontWeight.bold     // 700
```

### Espaçamento (`spacing.ts`)
```typescript
import { spacing } from '@/theme';

spacing.radius.lg    // '16px'
spacing.shadow.premium // Sombra premium
```

## 🔧 Services

Lógica de negócio extraída para services reutilizáveis:

### CardService
```typescript
import { CardService } from '@/services';

// Adicionar pontos
const { updatedCard, transaction } = CardService.addPoints(card, 5);

// Verificar se cartão está completo
CardService.isCardComplete(card); // boolean

// Coletar recompensa
CardService.collectReward(card);
```

### PinService
```typescript
import { PinService } from '@/services';

// Validar formato de PIN
PinService.isValidFormat(pin); // boolean

// Validar PIN
PinService.validatePin(inputPin, storePin);

// Formatar entrada
PinService.formatInput(value); // Remove não-dígitos
```

### ConfettiService
```typescript
import { ConfettiService } from '@/services';

// Celebração padrão
ConfettiService.celebrate();

// Celebração de cartão completo
ConfettiService.celebrateComplete();

// Celebração suave (pontos)
ConfettiService.celebratePoints();
```

## 📦 Exports Organizados

Cada pasta de componentes tem seu próprio `index.ts`:

```typescript
// Importar de gamification
import { ProgressBar, LevelBadge } from '@/components/gamification';

// Importar de cards
import { CardItem, QRScanner } from '@/components/cards';

// Importar de common
import { SearchBar, SortSelect } from '@/components/common';

// Importar services
import { CardService, PinService } from '@/services';
```

## 🎯 Padrões de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `CardItem.tsx`)
- **Services**: PascalCase + "Service" (ex: `CardService`)
- **Hooks**: camelCase + "use" prefix (ex: `useAuth`)
- **Types**: PascalCase (ex: `LoyaltyCard`)
- **Funções**: camelCase (ex: `getCardGradient`)

### Estrutura de Componente
```typescript
// 1. Imports
import { useState } from "react";
import { LoyaltyCard } from "@/types/card";
import { CardService } from "@/services";

// 2. Interface/Types
interface CardItemProps {
  card: LoyaltyCard;
}

// 3. Componente
export const CardItem = ({ card }: CardItemProps) => {
  // 4. Hooks
  const [loading, setLoading] = useState(false);
  
  // 5. Lógica
  const handleClick = () => {
    // usar service
    CardService.addPoints(card, 1);
  };
  
  // 6. Render
  return (
    <div>{/* JSX */}</div>
  );
};
```

### Separação de Responsabilidades
- **Screens**: Apenas UI e composição de componentes
- **Components**: UI reutilizável
- **Services**: Lógica de negócio pura
- **Hooks**: Lógica stateful reutilizável
- **Types**: Definições de tipos

## 🚀 Benefícios da Nova Estrutura

1. **Modularidade**: Código organizado em módulos claros
2. **Reutilização**: Componentes e serviços facilmente reutilizáveis
3. **Manutenibilidade**: Fácil encontrar e modificar código
4. **Escalabilidade**: Estrutura preparada para crescimento
5. **Testabilidade**: Services isolados são fáceis de testar
6. **Consistência**: Padrões claros em todo o projeto

## 📝 Próximos Passos

1. Refatorar telas complexas para usar mais services
2. Adicionar testes unitários para services
3. Criar documentação de componentes com Storybook
4. Implementar lazy loading de telas
5. Adicionar error boundaries

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-11-05

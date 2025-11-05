# Guia de Refatoração - Fidelize

## ✅ O que foi feito

### 1. **Reorganização de Pastas**
- ✅ `pages/` → `screens/`
- ✅ Componentes organizados por categoria:
  - `components/cards/` - Cartões
  - `components/gamification/` - Gamificação
  - `components/common/` - Comuns
  - `components/layout/` - Layout

### 2. **Services Criados**
- ✅ `CardService` - Lógica de cartões
- ✅ `PinService` - Validação de PIN
- ✅ `ConfettiService` - Animações

### 3. **Tema Global**
- ✅ `theme/colors.ts` - Paleta de cores
- ✅ `theme/typography.ts` - Tipografia
- ✅ `theme/spacing.ts` - Espaçamentos

### 4. **Exports Organizados**
- ✅ Índices criados em cada pasta
- ✅ Imports simplificados

## 📚 Como Usar

### Importar Componentes
```typescript
// Antes
import { ProgressBar } from "@/components/ProgressBar";

// Agora
import { ProgressBar } from "@/components/gamification";
// ou
import { ProgressBar } from "@/components/gamification/ProgressBar";
```

### Usar Services
```typescript
import { CardService, PinService, ConfettiService } from "@/services";

// Validar PIN
const validation = PinService.validateForAddPoints(inputPin, storePin);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}

// Adicionar pontos
const { updatedCard } = CardService.addPoints(card, points);

// Celebrar
ConfettiService.celebratePoints();
```

### Usar Tema
```typescript
import { colors, typography, spacing } from "@/theme";

// Classes Tailwind ainda funcionam normalmente
<div className="bg-primary text-white" />

// Mas agora você também pode usar programaticamente
const cardColor = colors.primary.DEFAULT;
const fontSize = typography.fontSize.xl;
```

## 🔄 Migração de Código Existente

### Exemplo: Refatorar lógica de adicionar pontos

**Antes:**
```typescript
const handleAddPoints = () => {
  if (pinInput !== card.storePin) {
    toast.error("PIN incorreto");
    return;
  }
  
  const points = parseInt(pointsToAdd) || 0;
  if (points <= 0) {
    toast.error("Insira quantidade válida");
    return;
  }
  
  const newPoints = card.points + points;
  // ... mais lógica
};
```

**Depois:**
```typescript
import { CardService, PinService, ConfettiService } from "@/services";

const handleAddPoints = () => {
  // Validar PIN
  const pinValidation = PinService.validateForAddPoints(pinInput, card.storePin);
  if (!pinValidation.valid) {
    toast.error(pinValidation.error);
    return;
  }
  
  // Validar pontos
  const { valid, points, error } = CardService.validatePointsAmount(pointsToAdd);
  if (!valid) {
    toast.error(error);
    return;
  }
  
  // Adicionar pontos
  const { updatedCard } = CardService.addPoints(card, points);
  setCards(cards.map(c => c.id === card.id ? updatedCard : c));
  
  // Celebrar
  ConfettiService.celebratePoints();
  
  toast.success(`${points} pontos adicionados!`);
};
```

## ⚠️ Regras Importantes

1. **NÃO** altere funcionalidades existentes
2. **SIM** use services para nova lógica
3. **SIM** mantenha componentes focados em UI
4. **NÃO** duplique código - use services
5. **SIM** documente código complexo

## 📁 Onde Colocar Novo Código

| Tipo | Localização |
|------|-------------|
| Nova tela | `src/screens/` |
| Componente de cartão | `src/components/cards/` |
| Componente de gamificação | `src/components/gamification/` |
| Componente reutilizável | `src/components/common/` |
| Lógica de negócio | `src/services/` |
| Hook customizado | `src/hooks/` |
| Tipo TypeScript | `src/types/` |

## 🎯 Próximas Melhorias Sugeridas

1. Migrar lógica de `CardDetails.tsx` para usar services
2. Criar `RewardService` para lógica de recompensas
3. Criar `AchievementService` para lógica de conquistas
4. Adicionar testes unitários para services
5. Documentar componentes com JSDoc

## 🚀 Benefícios

- ✅ Código mais limpo e organizado
- ✅ Fácil de encontrar e modificar
- ✅ Reutilização de código
- ✅ Manutenção simplificada
- ✅ Preparado para crescimento

---

**Importante**: Toda a funcionalidade permanece 100% intacta. Apenas a organização do código mudou!

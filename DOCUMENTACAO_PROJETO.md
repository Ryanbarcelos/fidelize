# 📱 FIDELIZE - Sistema de Fidelização Digital

## Documentação Completa do Projeto

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Funcionalidades](#funcionalidades)
6. [Fluxos de Usuário](#fluxos-de-usuário)
7. [Segurança](#segurança)
8. [Telas e Componentes](#telas-e-componentes)

---

## 🎯 VISÃO GERAL

### O que é o Fidelize?

O **Fidelize** é uma plataforma digital de fidelização de clientes que conecta **empresas/lojas** a seus **clientes**, oferecendo um sistema moderno de cartões de fidelidade, promoções automáticas e gamificação.

### Problema que Resolve

- Substituição de cartões físicos de fidelidade (papel/cartão)
- Centralização de programas de fidelidade em um único app
- Automação de promoções e recompensas
- Engajamento de clientes através de gamificação

### Público-Alvo

| Tipo | Descrição |
|------|-----------|
| **Clientes (Consumidores)** | Pessoas que frequentam lojas e querem acumular pontos |
| **Empresas (Lojistas)** | Donos de negócios que querem fidelizar clientes |

---

## 🏗️ ARQUITETURA DO SISTEMA

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ Screens │  │Components│  │  Hooks  │  │    Services     │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
└───────┼────────────┼───────────┼─────────────────┼──────────┘
        │            │           │                 │
        └────────────┴───────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  LOVABLE CLOUD (Backend)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Supabase                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │   Auth     │  │  Database  │  │ Edge Functions │  │   │
│  │  │(Autenticação)│ │ (PostgreSQL)│ │   (Deno)      │  │   │
│  │  └────────────┘  └────────────┘  └────────────────┘  │   │
│  │  ┌────────────┐  ┌────────────┐                      │   │
│  │  │    RLS     │  │  Triggers  │                      │   │
│  │  │ (Segurança)│  │ (Automação)│                      │   │
│  │  └────────────┘  └────────────┘                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Padrão de Comunicação

```
Cliente → API REST (Supabase) → Banco de Dados PostgreSQL
       ← Respostas JSON ←
```

---

## 💻 TECNOLOGIAS UTILIZADAS

### Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 18.3.1 | Framework de UI |
| **TypeScript** | - | Tipagem estática |
| **Vite** | - | Build tool |
| **Tailwind CSS** | - | Estilização |
| **Shadcn/UI** | - | Componentes de interface |
| **React Router** | 6.30.1 | Navegação |
| **TanStack Query** | 5.83.0 | Gerenciamento de estado servidor |
| **Recharts** | 2.15.4 | Gráficos e visualizações |
| **Lucide React** | 0.462.0 | Ícones |

### Backend (Lovable Cloud)

| Tecnologia | Função |
|------------|--------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Banco de dados |
| **Row Level Security (RLS)** | Segurança de dados |
| **Edge Functions (Deno)** | Lógica serverless |

### Bibliotecas Adicionais

| Biblioteca | Função |
|------------|--------|
| **canvas-confetti** | Animações de celebração |
| **html5-qrcode** | Leitura de QR Code |
| **react-qr-code** | Geração de QR Code |
| **jspdf** | Geração de relatórios PDF |
| **date-fns** | Manipulação de datas |
| **zod** | Validação de dados |

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais

#### 1. `profiles` - Perfis de Usuário
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT)
- email (TEXT)
- account_type (TEXT) -- 'customer' ou 'business'
- store_name (TEXT, nullable) -- Para contas business
- cnpj (TEXT, nullable)
- avatar_url (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `companies` - Empresas/Lojas
```sql
- id (UUID, PK)
- owner_id (UUID, FK → auth.users)
- name (TEXT)
- share_code (TEXT, UNIQUE) -- Código para clientes adicionarem
- pin_secret (TEXT) -- PIN de segurança
- created_at, updated_at (TIMESTAMP)
```

#### 3. `fidelity_cards` - Cartões de Fidelidade
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- company_id (UUID, FK → companies)
- balance (INTEGER) -- Pontos acumulados
- logo (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)
```

#### 4. `fidelity_transactions` - Transações
```sql
- id (UUID, PK)
- fidelity_card_id (UUID, FK)
- company_id (UUID, FK)
- user_id (UUID, FK)
- type (TEXT) -- 'points_added', 'points_removed', 'reward_collected'
- points (INTEGER)
- balance_after (INTEGER)
- created_by (TEXT) -- 'customer' ou 'business'
- created_at (TIMESTAMP)
```

#### 5. `automatic_promotions` - Promoções Automáticas
```sql
- id (UUID, PK)
- company_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- points_threshold (INTEGER) -- Pontos necessários
- reward_type (TEXT) -- 'discount', 'product', 'free_item'
- reward_value (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 6. `earned_promotions` - Promoções Conquistadas
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- fidelity_card_id (UUID, FK)
- promotion_id (UUID, FK)
- earned_at (TIMESTAMP)
- redeemed_at (TIMESTAMP, nullable)
- is_redeemed (BOOLEAN)
- pending_redemption (BOOLEAN)
- redemption_code (TEXT, nullable)
```

#### 7. `user_gamification` - Gamificação
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- current_level (INTEGER)
- current_xp (INTEGER)
- total_rewards_collected (INTEGER)
- current_streak (INTEGER)
- medals (TEXT[])
- last_access_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### 8. `user_achievements` - Conquistas
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- achievement_id (TEXT)
- current (INTEGER)
- completed (BOOLEAN)
- completed_at (TIMESTAMP)
- current_streak (INTEGER)
```

#### 9. `notifications` - Notificações
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- store_id (UUID, FK)
- promotion_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- store_name (TEXT)
- read (BOOLEAN)
- received_at (TIMESTAMP)
```

### Diagrama ER Simplificado

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   profiles   │     │  companies   │     │ fidelity_cards   │
│──────────────│     │──────────────│     │──────────────────│
│ user_id (PK) │◄───►│ owner_id     │◄───►│ company_id       │
│ account_type │     │ share_code   │     │ user_id          │
│ store_name   │     │ pin_secret   │     │ balance          │
└──────────────┘     └──────────────┘     └────────┬─────────┘
                                                    │
                                                    ▼
┌────────────────────┐     ┌──────────────────────────────────┐
│automatic_promotions│     │     fidelity_transactions         │
│────────────────────│     │──────────────────────────────────│
│ company_id         │     │ fidelity_card_id                 │
│ points_threshold   │     │ type (add/remove/reward)         │
│ reward_type        │     │ points                           │
└─────────┬──────────┘     └──────────────────────────────────┘
          │
          ▼
┌──────────────────┐
│ earned_promotions│
│──────────────────│
│ user_id          │
│ promotion_id     │
│ is_redeemed      │
└──────────────────┘
```

---

## ⚙️ FUNCIONALIDADES

### Para Clientes (Consumidores)

| Funcionalidade | Descrição |
|----------------|-----------|
| **Cadastro/Login** | Autenticação por email/senha |
| **Adicionar Lojas** | Via código de compartilhamento (share_code) |
| **Ver Cartões** | Lista de todos os cartões de fidelidade |
| **Acumular Pontos** | Através de QR Code ou código da loja |
| **Ver Promoções** | Promoções disponíveis das lojas |
| **Resgatar Recompensas** | Usar pontos para benefícios |
| **Histórico** | Ver todas as transações |
| **Conquistas** | Sistema de gamificação com medalhas |
| **Notificações** | Alertas de novas promoções |
| **Perfil** | Gerenciar dados pessoais |

### Para Empresas (Lojistas)

| Funcionalidade | Descrição |
|----------------|-----------|
| **Dashboard** | Visão geral do negócio |
| **Gerenciar Clientes** | Ver e gerenciar cartões de clientes |
| **Adicionar Pontos** | Via PIN de segurança |
| **Criar Promoções** | Promoções automáticas baseadas em pontos |
| **Validar Resgates** | Confirmar uso de recompensas |
| **Relatórios** | Análise de dados e métricas |
| **Código de Compartilhamento** | Para clientes adicionarem a loja |

---

## 🔄 FLUXOS DE USUÁRIO

### Fluxo 1: Cliente Adiciona Loja

```
1. Cliente faz login
2. Clica em "Adicionar Loja"
3. Digita o código de compartilhamento (ex: LANCHONETE1)
4. Sistema busca a empresa pelo código
5. Cria um novo fidelity_card vinculado
6. Cliente vê o novo cartão na Home
```

### Fluxo 2: Acumular Pontos

```
1. Cliente vai à loja física
2. Abre o app e mostra QR Code do cartão
3. Lojista escaneia ou digita código + PIN
4. Sistema valida PIN e adiciona pontos
5. Transação é registrada
6. Cliente recebe animação de celebração
7. Se atingir threshold, ganha promoção automaticamente
```

### Fluxo 3: Resgatar Recompensa

```
1. Cliente acumula pontos suficientes
2. Sistema detecta e cria earned_promotion
3. Cliente vê promoção disponível
4. Vai à loja e solicita resgate
5. Lojista valida código de resgate
6. Promoção marcada como resgatada
7. Pontos são deduzidos (se aplicável)
```

### Fluxo 4: Gamificação

```
1. Cliente realiza ações (adicionar pontos, resgatar, etc.)
2. Sistema atualiza XP e verifica conquistas
3. Se subir de nível → celebração
4. Se completar conquista → medalha desbloqueada
5. Streak de dias consecutivos aumenta
```

---

## 🔒 SEGURANÇA

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:

| Regra | Descrição |
|-------|-----------|
| **Isolamento de dados** | Usuários só veem seus próprios dados |
| **Acesso business** | Lojistas acessam dados de clientes de sua empresa |
| **Funções SECURITY DEFINER** | Evitam recursão infinita nas políticas |

### Funções de Segurança

```sql
-- Verifica se usuário é dono da empresa
user_owns_company(company_uuid)

-- Verifica se usuário tem cartão na empresa
user_has_card_for_company(company_uuid)
```

### Validação de PIN

- PIN de 4 dígitos por empresa
- Validado via Edge Function
- Necessário para adicionar pontos

---

## 📱 TELAS E COMPONENTES

### Telas do Cliente

| Tela | Rota | Descrição |
|------|------|-----------|
| Login | `/login` | Autenticação |
| Cadastro | `/signup` | Registro de novo usuário |
| Home | `/` | Lista de cartões de fidelidade |
| Detalhes do Cartão | `/fidelity-card/:id` | Ver cartão específico |
| Histórico | `/fidelity-card/:id/history` | Transações do cartão |
| Adicionar Loja | `/add-card` | Adicionar via share code |
| Promoções | `/promotions` | Ver promoções disponíveis |
| Conquistas Ganhas | `/earned-promotions` | Recompensas para resgatar |
| Achievements | `/achievements` | Medalhas e conquistas |
| Notificações | `/notifications` | Alertas do sistema |
| Perfil | `/profile` | Configurações do usuário |
| Lojas Próximas | `/nearby-stores` | Mapa de lojas |

### Telas do Lojista

| Tela | Rota | Descrição |
|------|------|-----------|
| Dashboard | `/business-dashboard` | Painel principal |
| Clientes | `/store-clients` | Gerenciar clientes |
| Promoções | `/automatic-promotions` | Criar/editar promoções |
| Validar Resgate | `/validate-redemption` | Confirmar uso de promoção |
| Relatórios | `/business-reports` | Métricas e análises |
| Painel da Loja | `/store-panel` | Configurações da loja |

### Componentes Principais

```
src/components/
├── ui/              # Componentes Shadcn/UI
├── cards/           # Componentes de cartões
│   ├── CardItem.tsx
│   ├── FidelityCardItem.tsx
│   ├── QRCodeDisplay.tsx
│   ├── QRScanner.tsx
│   └── PinValidationDialog.tsx
├── gamification/    # Sistema de gamificação
│   ├── AchievementCard.tsx
│   ├── LevelBadge.tsx
│   ├── MedalDisplay.tsx
│   ├── ProgressBar.tsx
│   └── CelebrationDialog.tsx
├── layout/          # Layout e navegação
│   └── BottomNavigation.tsx
├── common/          # Componentes compartilhados
│   ├── SearchBar.tsx
│   └── SortSelect.tsx
└── charts/          # Gráficos
    └── ClientPointsChart.tsx
```

### Hooks Personalizados

```
src/hooks/
├── useAuth.ts              # Autenticação
├── useFidelityCards.ts     # Cartões de fidelidade
├── useFidelityTransactions.ts # Transações
├── useCompanies.ts         # Empresas
├── useGamification.ts      # Sistema de níveis/XP
├── useAchievements.ts      # Conquistas
├── useNotifications.ts     # Notificações
├── usePromotions.ts        # Promoções
├── useAutomaticPromotions.ts # Promoções automáticas
└── useLocation.ts          # Geolocalização
```

### Serviços

```
src/services/
├── cardService.ts      # Lógica de cartões
├── pinService.ts       # Validação de PIN
└── confettiService.ts  # Animações de celebração
```

---

## 📊 MÉTRICAS E RELATÓRIOS

### Dados Disponíveis para Análise

- Total de clientes por empresa
- Pontos distribuídos por período
- Promoções resgatadas
- Clientes mais ativos
- Taxa de resgate de promoções
- Crescimento de base de clientes

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### Níveis

| Nível | XP Necessário |
|-------|---------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| 4 | 600 |
| 5+ | Progressivo |

### Fontes de XP

- Adicionar pontos: +10 XP
- Resgatar recompensa: +50 XP
- Completar conquista: +100 XP
- Streak diário: +5 XP por dia

### Tipos de Conquistas

- Primeiro cartão adicionado
- X pontos acumulados
- X recompensas resgatadas
- Streak de X dias
- Visitar X lojas diferentes

---

## 🚀 COMO EXECUTAR

### Requisitos

- Node.js 18+
- npm ou bun

### Comandos

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 📝 RESUMO EXECUTIVO

### Pontos Fortes

✅ Interface moderna e responsiva
✅ Sistema de gamificação engajante
✅ Segurança robusta com RLS
✅ Dois tipos de usuário (cliente/lojista)
✅ Promoções automáticas
✅ QR Code para facilitar operações
✅ Relatórios e métricas

### Diferenciais

🎯 **Gamificação** - Níveis, medalhas e conquistas
🎯 **Automação** - Promoções baseadas em pontos
🎯 **Simplicidade** - Share code para adicionar lojas
🎯 **Segurança** - PIN + RLS + Edge Functions

---

*Documentação gerada em 03/12/2025*
*Versão: 1.0*

-- Tabela de tokens temporários para transações
CREATE TABLE public.transaction_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT FALSE,
  action_type TEXT NOT NULL CHECK (action_type IN ('add_points', 'collect_reward'))
);

-- Índice para busca rápida por token
CREATE INDEX idx_transaction_tokens_token ON public.transaction_tokens(token);

-- Índice para limpeza de tokens expirados
CREATE INDEX idx_transaction_tokens_expires_at ON public.transaction_tokens(expires_at);

-- Tabela de auditoria para todas as operações
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID REFERENCES loyalty_cards(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_info TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por usuário
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Índice para busca por cartão
CREATE INDEX idx_audit_logs_card_id ON public.audit_logs(card_id);

-- Índice para busca por timestamp
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS para transaction_tokens
ALTER TABLE public.transaction_tokens ENABLE ROW LEVEL SECURITY;

-- Usuários podem criar tokens para seus próprios cartões
CREATE POLICY "Users can create tokens for their cards"
ON public.transaction_tokens
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM loyalty_cards
    WHERE loyalty_cards.id = transaction_tokens.card_id
    AND loyalty_cards.user_id = auth.uid()
  )
);

-- Usuários podem ver tokens de seus próprios cartões
CREATE POLICY "Users can view their card tokens"
ON public.transaction_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loyalty_cards
    WHERE loyalty_cards.id = transaction_tokens.card_id
    AND loyalty_cards.user_id = auth.uid()
  )
);

-- Lojas podem ver e atualizar tokens de cartões de suas lojas
CREATE POLICY "Business can view and update tokens for their store"
ON public.transaction_tokens
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM loyalty_cards lc
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE lc.id = transaction_tokens.card_id
    AND p.account_type = 'business'
    AND p.store_name = lc.store_name
  )
);

-- RLS para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir seus próprios logs
CREATE POLICY "Users can insert their own logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view their own logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Lojas podem ver logs relacionados aos seus cartões
CREATE POLICY "Business can view logs for their store cards"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loyalty_cards lc
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE lc.id = audit_logs.card_id
    AND p.account_type = 'business'
    AND p.store_name = lc.store_name
  )
);
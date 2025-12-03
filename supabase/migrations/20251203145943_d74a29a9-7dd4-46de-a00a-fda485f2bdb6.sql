-- Create fidelity_transactions table for transaction history
CREATE TABLE public.fidelity_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fidelity_card_id uuid NOT NULL REFERENCES public.fidelity_cards(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('points_added', 'points_removed', 'reward_collected')),
  points integer NOT NULL,
  balance_after integer NOT NULL,
  created_by text DEFAULT 'customer', -- 'customer' or 'business'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fidelity_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions for their own cards
CREATE POLICY "Users can view their own transactions"
ON public.fidelity_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert transactions for their own cards
CREATE POLICY "Users can insert their own transactions"
ON public.fidelity_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Company owners can view transactions for their company
CREATE POLICY "Company owners can view company transactions"
ON public.fidelity_transactions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.companies
  WHERE companies.id = fidelity_transactions.company_id
  AND companies.owner_id = auth.uid()
));

-- Company owners can insert transactions for their company
CREATE POLICY "Company owners can insert company transactions"
ON public.fidelity_transactions
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.companies
  WHERE companies.id = fidelity_transactions.company_id
  AND companies.owner_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_fidelity_transactions_card_id ON public.fidelity_transactions(fidelity_card_id);
CREATE INDEX idx_fidelity_transactions_company_id ON public.fidelity_transactions(company_id);
CREATE INDEX idx_fidelity_transactions_created_at ON public.fidelity_transactions(created_at DESC);
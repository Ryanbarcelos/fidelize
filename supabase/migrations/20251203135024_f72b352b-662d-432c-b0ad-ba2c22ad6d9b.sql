-- 1. Cria a tabela de Lojas (companies)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  share_code text UNIQUE NOT NULL,
  pin_secret text NOT NULL DEFAULT '1234',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Cria a tabela de Cartões de Fidelidade (fidelity_cards)
CREATE TABLE IF NOT EXISTS public.fidelity_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  balance int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- 3. Habilita RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fidelity_cards ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para companies
CREATE POLICY "Anyone can view companies by share_code"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their companies"
  ON public.companies FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5. Políticas para fidelity_cards
CREATE POLICY "Users can view their own cards"
  ON public.fidelity_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
  ON public.fidelity_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON public.fidelity_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON public.fidelity_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Company owners can view cards for their company"
  ON public.fidelity_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = fidelity_cards.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update cards for their company"
  ON public.fidelity_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = fidelity_cards.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- 6. Trigger para updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fidelity_cards_updated_at
  BEFORE UPDATE ON public.fidelity_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Cria uma loja de teste
INSERT INTO public.companies (name, share_code, pin_secret)
VALUES ('Barbearia TCC', 'TCC2024', '1234')
ON CONFLICT (share_code) DO NOTHING;
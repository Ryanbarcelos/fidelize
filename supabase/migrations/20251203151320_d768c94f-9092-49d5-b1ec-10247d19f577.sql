-- Create automatic promotions table for businesses to define rules
CREATE TABLE public.automatic_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  points_threshold INTEGER NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'discount', -- 'discount', 'free_item', 'bonus_points'
  reward_value TEXT NOT NULL, -- e.g., "10%", "Café grátis", "5 pontos"
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create earned promotions table to track which promotions customers have earned
CREATE TABLE public.earned_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fidelity_card_id UUID NOT NULL REFERENCES public.fidelity_cards(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES public.automatic_promotions(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(fidelity_card_id, promotion_id)
);

-- Enable RLS
ALTER TABLE public.automatic_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_promotions ENABLE ROW LEVEL SECURITY;

-- Policies for automatic_promotions
CREATE POLICY "Company owners can manage their promotions"
ON public.automatic_promotions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.companies 
  WHERE companies.id = automatic_promotions.company_id 
  AND companies.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.companies 
  WHERE companies.id = automatic_promotions.company_id 
  AND companies.owner_id = auth.uid()
));

CREATE POLICY "Users can view active promotions for their cards"
ON public.automatic_promotions
FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.fidelity_cards 
    WHERE fidelity_cards.company_id = automatic_promotions.company_id 
    AND fidelity_cards.user_id = auth.uid()
  )
);

-- Policies for earned_promotions
CREATE POLICY "Users can view their own earned promotions"
ON public.earned_promotions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earned promotions"
ON public.earned_promotions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Company owners can view earned promotions for their company"
ON public.earned_promotions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.automatic_promotions ap
  JOIN public.companies c ON c.id = ap.company_id
  WHERE ap.id = earned_promotions.promotion_id
  AND c.owner_id = auth.uid()
));

CREATE POLICY "Company owners can update earned promotions (mark as redeemed)"
ON public.earned_promotions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.automatic_promotions ap
  JOIN public.companies c ON c.id = ap.company_id
  WHERE ap.id = earned_promotions.promotion_id
  AND c.owner_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_automatic_promotions_updated_at
BEFORE UPDATE ON public.automatic_promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
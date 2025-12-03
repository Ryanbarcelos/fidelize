-- Create a security definer function to check if user owns a company
CREATE OR REPLACE FUNCTION public.user_owns_company(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = company_uuid AND owner_id = auth.uid()
  );
$$;

-- Create a security definer function to check if user has a card for a company
CREATE OR REPLACE FUNCTION public.user_has_card_for_company(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fidelity_cards
    WHERE company_id = company_uuid AND user_id = auth.uid()
  );
$$;

-- Drop problematic policies on companies
DROP POLICY IF EXISTS "Users can view companies they have cards for" ON public.companies;

-- Recreate without recursion
CREATE POLICY "Users can view companies they have cards for" 
ON public.companies 
FOR SELECT 
USING (public.user_has_card_for_company(id));

-- Drop and recreate fidelity_cards policies
DROP POLICY IF EXISTS "Company owners can view cards for their company" ON public.fidelity_cards;
DROP POLICY IF EXISTS "Company owners can update cards for their company" ON public.fidelity_cards;

CREATE POLICY "Company owners can view cards for their company" 
ON public.fidelity_cards 
FOR SELECT 
USING (public.user_owns_company(company_id));

CREATE POLICY "Company owners can update cards for their company" 
ON public.fidelity_cards 
FOR UPDATE 
USING (public.user_owns_company(company_id));

-- Fix profiles policy
DROP POLICY IF EXISTS "Business owners can view customer profiles" ON public.profiles;

CREATE POLICY "Business owners can view customer profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id
);
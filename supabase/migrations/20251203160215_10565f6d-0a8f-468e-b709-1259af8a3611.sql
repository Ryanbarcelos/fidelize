-- Drop the overly permissive policy that exposes pin_secret
DROP POLICY IF EXISTS "Anyone can view companies by share_code" ON public.companies;

-- Create a more secure policy that only exposes non-sensitive columns
-- We'll use a view for public access instead
CREATE OR REPLACE VIEW public.companies_public AS
SELECT id, name, share_code, owner_id, created_at, updated_at
FROM public.companies;

-- Grant select on the view to authenticated and anon users
GRANT SELECT ON public.companies_public TO authenticated, anon;

-- Create a new policy for authenticated users to view companies they have cards for
CREATE POLICY "Users can view companies they have cards for"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fidelity_cards
    WHERE fidelity_cards.company_id = companies.id
    AND fidelity_cards.user_id = auth.uid()
  )
);

-- Keep the owner policy for full access
-- (already exists: "Owners can manage their companies")
-- Allow business owners to view profiles of their customers
CREATE POLICY "Business owners can view customer profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fidelity_cards fc
    JOIN public.companies c ON c.id = fc.company_id
    WHERE fc.user_id = profiles.user_id
    AND c.owner_id = auth.uid()
  )
);
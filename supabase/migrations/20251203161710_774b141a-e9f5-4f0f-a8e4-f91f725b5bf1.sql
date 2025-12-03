-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Business owners can view customer profiles" ON public.profiles;

-- Create a simpler policy that doesn't cause recursion
-- Business owners can view profiles of users who have cards in their company
CREATE POLICY "Business owners can view customer profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.fidelity_cards fc
      WHERE fc.company_id = c.id 
      AND fc.user_id = profiles.user_id
    )
  )
);
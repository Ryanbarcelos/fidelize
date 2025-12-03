-- Drop the incorrect policy
DROP POLICY IF EXISTS "Business owners can view customer profiles" ON public.profiles;

-- Create a proper policy that allows business owners to view profiles of their customers
CREATE POLICY "Business owners can view their customers profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.fidelity_cards fc
    JOIN public.companies c ON c.id = fc.company_id
    WHERE fc.user_id = profiles.user_id 
    AND c.owner_id = auth.uid()
  )
);
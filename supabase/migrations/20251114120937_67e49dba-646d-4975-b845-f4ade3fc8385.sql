-- Fix critical security flaw in transactions table RLS policy
-- Current policy checks profiles.store_name = profiles.store_name (always true)
-- Should check profiles.store_name = transactions.store_name

-- Drop the flawed policy
DROP POLICY IF EXISTS "Business users can insert transactions for their store" ON public.transactions;

-- Create the corrected policy
CREATE POLICY "Business users can insert transactions for their store"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.account_type = 'business'
      AND profiles.store_name = transactions.store_name
  )
);
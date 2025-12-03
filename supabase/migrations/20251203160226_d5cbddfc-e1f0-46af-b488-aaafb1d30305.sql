-- Fix the view to use SECURITY INVOKER (safer)
DROP VIEW IF EXISTS public.companies_public;

CREATE VIEW public.companies_public 
WITH (security_invoker = true)
AS
SELECT id, name, share_code, owner_id, created_at, updated_at
FROM public.companies;

-- Grant select on the view to authenticated and anon users
GRANT SELECT ON public.companies_public TO authenticated, anon;
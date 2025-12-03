-- Create a secure function to find company by share_code (excludes pin_secret)
CREATE OR REPLACE FUNCTION public.find_company_by_share_code(p_share_code text)
RETURNS TABLE (
  id uuid,
  name text,
  share_code text,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    c.share_code,
    c.owner_id,
    c.created_at,
    c.updated_at
  FROM public.companies c
  WHERE c.share_code = UPPER(p_share_code)
  LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.find_company_by_share_code(text) TO authenticated;
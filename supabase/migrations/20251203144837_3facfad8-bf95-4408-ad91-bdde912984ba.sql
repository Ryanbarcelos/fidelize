-- Function to generate a unique share_code from store name
CREATE OR REPLACE FUNCTION public.generate_share_code(store_name text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_code text;
  final_code text;
  counter int := 0;
BEGIN
  -- Create base code from store name (uppercase, no spaces, max 10 chars)
  base_code := upper(regexp_replace(unaccent(store_name), '[^a-zA-Z0-9]', '', 'g'));
  base_code := substring(base_code from 1 for 10);
  
  -- Try the base code first
  final_code := base_code;
  
  -- If it exists, add numbers until unique
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE share_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::text;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Function to create company when business user signs up
CREATE OR REPLACE FUNCTION public.handle_new_business_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create company if account_type is 'business' and store_name is provided
  IF NEW.account_type = 'business' AND NEW.store_name IS NOT NULL THEN
    INSERT INTO public.companies (name, share_code, owner_id, pin_secret)
    VALUES (
      NEW.store_name,
      public.generate_share_code(NEW.store_name),
      NEW.user_id,
      '1234'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create company after profile is created
DROP TRIGGER IF EXISTS on_business_profile_created ON public.profiles;
CREATE TRIGGER on_business_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business_user();

-- Enable unaccent extension for removing accents
CREATE EXTENSION IF NOT EXISTS unaccent;
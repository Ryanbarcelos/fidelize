-- Make store_id and promotion_id nullable for system notifications (achievements, etc.)
ALTER TABLE public.notifications 
  ALTER COLUMN store_id DROP NOT NULL,
  ALTER COLUMN promotion_id DROP NOT NULL,
  ALTER COLUMN store_name DROP NOT NULL;

-- Add notification_type column to differentiate notification sources
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS notification_type text DEFAULT 'promotion';

-- Update existing notifications
UPDATE public.notifications SET notification_type = 'promotion' WHERE notification_type IS NULL;

-- Add RLS policy for system notifications (user can view their own)
-- Existing policies already handle this since they check user_id
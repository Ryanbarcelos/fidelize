-- Add redemption_code to earned_promotions for validation
ALTER TABLE public.earned_promotions 
ADD COLUMN redemption_code TEXT,
ADD COLUMN pending_redemption BOOLEAN DEFAULT false;

-- Create index for quick lookup by redemption code
CREATE INDEX idx_earned_promotions_redemption_code ON public.earned_promotions(redemption_code) WHERE redemption_code IS NOT NULL;
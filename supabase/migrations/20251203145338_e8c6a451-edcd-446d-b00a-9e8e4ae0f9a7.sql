-- Add logo column to fidelity_cards table
ALTER TABLE public.fidelity_cards ADD COLUMN IF NOT EXISTS logo text;
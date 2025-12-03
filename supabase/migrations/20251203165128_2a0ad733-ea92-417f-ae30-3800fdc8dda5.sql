-- Enable realtime for fidelity_cards table
ALTER TABLE public.fidelity_cards REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fidelity_cards;

-- Enable realtime for earned_promotions table
ALTER TABLE public.earned_promotions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.earned_promotions;

-- Enable realtime for user_gamification table
ALTER TABLE public.user_gamification REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_gamification;
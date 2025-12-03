-- Enable realtime for fidelity_transactions table
ALTER TABLE public.fidelity_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fidelity_transactions;
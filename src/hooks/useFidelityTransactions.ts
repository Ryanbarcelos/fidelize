import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FidelityTransaction {
  id: string;
  fidelityCardId: string;
  companyId: string;
  userId: string;
  type: "points_added" | "points_removed" | "reward_collected";
  points: number;
  balanceAfter: number;
  createdBy: "customer" | "business";
  createdAt: string;
  company?: {
    name: string;
  };
}

export function useFidelityTransactions(cardId?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FidelityTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && cardId) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user, cardId]);

  const fetchTransactions = async () => {
    if (!cardId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fidelity_transactions")
        .select(`
          *,
          companies:company_id (name)
        `)
        .eq("fidelity_card_id", cardId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformed: FidelityTransaction[] = (data || []).map((t: any) => ({
        id: t.id,
        fidelityCardId: t.fidelity_card_id,
        companyId: t.company_id,
        userId: t.user_id,
        type: t.type,
        points: t.points,
        balanceAfter: t.balance_after,
        createdBy: t.created_by,
        createdAt: t.created_at,
        company: t.companies ? { name: t.companies.name } : undefined,
      }));

      setTransactions(transformed);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (
    fidelityCardId: string,
    companyId: string,
    type: "points_added" | "points_removed" | "reward_collected",
    points: number,
    balanceAfter: number,
    createdBy: "customer" | "business" = "customer"
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const { error } = await supabase
        .from("fidelity_transactions")
        .insert({
          fidelity_card_id: fidelityCardId,
          company_id: companyId,
          user_id: user.id,
          type,
          points,
          balance_after: balanceAfter,
          created_by: createdBy,
        });

      if (error) throw error;

      if (cardId) {
        await fetchTransactions();
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions,
  };
}
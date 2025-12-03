import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FidelityCard {
  id: string;
  userId: string;
  companyId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    shareCode: string;
  };
}

export interface FidelityClient {
  id: string;
  balance: number;
  createdAt: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

export function useFidelityCards() {
  const { user, currentUser } = useAuth();
  const [cards, setCards] = useState<FidelityCard[]>([]);
  const [clients, setClients] = useState<FidelityClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (currentUser?.accountType === 'business') {
        fetchClientsForCompany();
      } else {
        fetchMyCards();
      }
    } else {
      setCards([]);
      setClients([]);
      setLoading(false);
    }
  }, [user, currentUser]);

  const fetchMyCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fidelity_cards")
        .select(`
          *,
          companies:company_id (
            id,
            name,
            share_code
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedCards: FidelityCard[] = (data || []).map((card: any) => ({
        id: card.id,
        userId: card.user_id,
        companyId: card.company_id,
        balance: card.balance,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        company: card.companies ? {
          id: card.companies.id,
          name: card.companies.name,
          shareCode: card.companies.share_code,
        } : undefined,
      }));

      setCards(transformedCards);
    } catch (error) {
      console.error("Error fetching fidelity cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsForCompany = async () => {
    try {
      setLoading(true);
      
      // First get the company owned by this user
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user!.id)
        .maybeSingle();

      if (companyError) throw companyError;
      if (!companyData) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Then get all fidelity cards for this company
      const { data, error } = await supabase
        .from("fidelity_cards")
        .select("*")
        .eq("company_id", companyData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedClients: FidelityClient[] = (data || []).map((card: any) => ({
        id: card.id,
        balance: card.balance,
        createdAt: card.created_at,
        userId: card.user_id,
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const addStoreByCode = async (shareCode: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      // Find the company by share code
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("share_code", shareCode.toUpperCase())
        .maybeSingle();

      if (companyError) throw companyError;
      if (!companyData) {
        return { success: false, error: "Loja não encontrada. Verifique o código." };
      }

      // Check if already linked
      const { data: existingCard } = await supabase
        .from("fidelity_cards")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_id", companyData.id)
        .maybeSingle();

      if (existingCard) {
        return { success: false, error: "Você já tem um cartão desta loja." };
      }

      // Create the fidelity card
      const { error: insertError } = await supabase
        .from("fidelity_cards")
        .insert({
          user_id: user.id,
          company_id: companyData.id,
          balance: 0,
        });

      if (insertError) throw insertError;

      await fetchMyCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding store:", error);
      return { success: false, error: error.message };
    }
  };

  const updateCardBalance = async (cardId: string, newBalance: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("fidelity_cards")
        .update({ balance: newBalance })
        .eq("id", cardId);

      if (error) throw error;

      // Refresh data
      if (currentUser?.accountType === 'business') {
        await fetchClientsForCompany();
      } else {
        await fetchMyCards();
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error updating card balance:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteCard = async (cardId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("fidelity_cards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      await fetchMyCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting card:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    cards,
    clients,
    loading,
    addStoreByCode,
    updateCardBalance,
    deleteCard,
    refetchCards: fetchMyCards,
    refetchClients: fetchClientsForCompany,
  };
}

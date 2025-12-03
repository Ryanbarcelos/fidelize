import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FidelityCard {
  id: string;
  userId: string;
  companyId: string;
  balance: number;
  logo?: string;
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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMyCards = useCallback(async () => {
    if (!user) return;
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedCards: FidelityCard[] = (data || []).map((card: any) => ({
        id: card.id,
        userId: card.user_id,
        companyId: card.company_id,
        balance: card.balance,
        logo: card.logo,
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
  }, [user]);

  const fetchClientsForCompany = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // First get the company owned by this user
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (companyError) throw companyError;
      if (!companyData) {
        setClients([]);
        setCompanyId(null);
        setLoading(false);
        return;
      }

      setCompanyId(companyData.id);

      // Then get all fidelity cards for this company
      const { data, error } = await supabase
        .from("fidelity_cards")
        .select("*")
        .eq("company_id", companyData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles for all card holders
      const userIds = (data || []).map((card: any) => card.user_id);
      let profilesMap: Record<string, { name: string; email: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, email")
          .in("user_id", userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc: any, profile: any) => {
            acc[profile.user_id] = { name: profile.name, email: profile.email };
            return acc;
          }, {});
        }
      }

      const transformedClients: FidelityClient[] = (data || []).map((card: any) => ({
        id: card.id,
        balance: card.balance,
        createdAt: card.created_at,
        userId: card.user_id,
        userName: profilesMap[card.user_id]?.name,
        userEmail: profilesMap[card.user_id]?.email,
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
  }, [user, currentUser, fetchMyCards, fetchClientsForCompany]);

  // Real-time subscription for customer cards
  useEffect(() => {
    if (!user || currentUser?.accountType === 'business') return;

    const channel = supabase
      .channel('fidelity-cards-customer')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fidelity_cards',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchMyCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentUser, fetchMyCards]);

  // Real-time subscription for business (company clients)
  useEffect(() => {
    if (!user || currentUser?.accountType !== 'business' || !companyId) return;

    const channel = supabase
      .channel('fidelity-cards-business')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fidelity_cards',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchClientsForCompany();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentUser, companyId, fetchClientsForCompany]);

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

  const updateCardLogo = async (cardId: string, logo: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("fidelity_cards")
        .update({ logo })
        .eq("id", cardId);

      if (error) throw error;

      await fetchMyCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating card logo:", error);
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
    updateCardLogo,
    refetchCards: fetchMyCards,
    refetchClients: fetchClientsForCompany,
  };
}

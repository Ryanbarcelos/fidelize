import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { LoyaltyCard } from "@/types/card";
import { Transaction } from "@/types/transaction";

export function useCards() {
  const { user, currentUser } = useAuth();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    } else {
      setCards([]);
      setLoading(false);
    }
  }, [user, currentUser]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("loyalty_cards")
        .select(`
          *,
          transactions (*)
        `);

      // If business user, fetch cards from their store
      if (currentUser?.accountType === 'business' && currentUser?.storeName) {
        query = query.eq("store_name", currentUser.storeName);
      } else {
        query = query.eq("user_id", user!.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match LoyaltyCard type
      const transformedCards: LoyaltyCard[] = (data || []).map((card: any) => ({
        id: card.id,
        storeName: card.store_name,
        userName: card.user_name,
        cardNumber: card.card_number,
        points: card.points,
        storePin: card.store_pin,
        logo: card.logo,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        transactions: (card.transactions || []).map((t: any) => ({
          id: t.id,
          cardId: t.card_id,
          type: t.type,
          points: t.points,
          storeName: t.store_name,
          userName: t.user_name,
          timestamp: t.timestamp,
        })),
      }));

      setCards(transformedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (
    storeName: string,
    userName: string,
    cardNumber: string,
    storePin: string,
    logo?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("loyalty_cards")
        .insert({
          user_id: user.id,
          store_name: storeName,
          user_name: userName,
          card_number: cardNumber,
          store_pin: storePin,
          logo,
          points: 0,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCards();
      return { success: true, data };
    } catch (error: any) {
      console.error("Error adding card:", error);
      return { success: false, error: error.message };
    }
  };

  const updateCard = async (cardId: string, updates: Partial<LoyaltyCard>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("loyalty_cards")
        .update({
          store_name: updates.storeName,
          user_name: updates.userName,
          card_number: updates.cardNumber,
          points: updates.points,
          store_pin: updates.storePin,
          logo: updates.logo,
        })
        .eq("id", cardId);

      if (error) throw error;

      await fetchCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating card:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("loyalty_cards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      await fetchCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting card:", error);
      return { success: false, error: error.message };
    }
  };

  const addTransaction = async (
    cardId: string,
    type: Transaction["type"],
    points: number,
    storeName: string,
    userName?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          card_id: cardId,
          type,
          points,
          store_name: storeName,
          user_name: userName,
        });

      if (error) throw error;

      await fetchCards();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    cards,
    loading,
    addCard,
    updateCard,
    deleteCard,
    addTransaction,
    refetch: fetchCards,
  };
}

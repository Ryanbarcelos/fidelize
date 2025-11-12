import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Promotion } from "@/types/promotion";

export function usePromotions() {
  const { user, currentUser } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPromotions();
    } else {
      setPromotions([]);
      setLoading(false);
    }
  }, [user, currentUser]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("promotions")
        .select("*");

      // If business user, fetch only their promotions
      if (currentUser?.accountType === 'business') {
        query = query.eq("store_id", user!.id);
      } else {
        // For customers, only show active promotions
        query = query.eq("is_active", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match Promotion type
      const transformedPromotions: Promotion[] = (data || []).map((promo: any) => ({
        id: promo.id,
        storeId: promo.store_id,
        storeName: promo.store_name,
        title: promo.title,
        description: promo.description,
        startDate: promo.start_date,
        endDate: promo.end_date,
        imageUrl: promo.image_url,
        isActive: promo.is_active,
        createdAt: promo.created_at,
        updatedAt: promo.updated_at,
      }));

      setPromotions(transformedPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPromotion = async (
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    imageUrl?: string
  ) => {
    if (!user || !currentUser || currentUser.accountType !== 'business') return;

    try {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          store_id: user.id,
          store_name: currentUser.storeName || '',
          title,
          description,
          start_date: startDate,
          end_date: endDate,
          image_url: imageUrl,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPromotions();
      return { success: true, data };
    } catch (error: any) {
      console.error("Error adding promotion:", error);
      return { success: false, error: error.message };
    }
  };

  const updatePromotion = async (
    promotionId: string,
    updates: Partial<Promotion>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("promotions")
        .update({
          title: updates.title,
          description: updates.description,
          start_date: updates.startDate,
          end_date: updates.endDate,
          image_url: updates.imageUrl,
          is_active: updates.isActive,
        })
        .eq("id", promotionId);

      if (error) throw error;

      await fetchPromotions();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating promotion:", error);
      return { success: false, error: error.message };
    }
  };

  const deletePromotion = async (promotionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);

      if (error) throw error;

      await fetchPromotions();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting promotion:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    promotions,
    loading,
    addPromotion,
    updatePromotion,
    deletePromotion,
    refetch: fetchPromotions,
  };
}

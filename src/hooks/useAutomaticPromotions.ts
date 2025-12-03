import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCompanies } from "./useCompanies";

export interface AutomaticPromotion {
  id: string;
  companyId: string;
  pointsThreshold: number;
  rewardType: "discount" | "free_item" | "bonus_points";
  rewardValue: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface EarnedPromotion {
  id: string;
  userId: string;
  fidelityCardId: string;
  promotionId: string;
  earnedAt: string;
  redeemedAt?: string;
  isRedeemed: boolean;
  redemptionCode?: string;
  pendingRedemption?: boolean;
  promotion?: AutomaticPromotion;
}

export function useAutomaticPromotions() {
  const { user } = useAuth();
  const { company } = useCompanies();
  const [promotions, setPromotions] = useState<AutomaticPromotion[]>([]);
  const [earnedPromotions, setEarnedPromotions] = useState<EarnedPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && company) {
      fetchPromotions();
    } else {
      setPromotions([]);
      setLoading(false);
    }
  }, [user, company]);

  const fetchPromotions = async () => {
    if (!company) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("automatic_promotions")
        .select("*")
        .eq("company_id", company.id)
        .order("points_threshold", { ascending: true });

      if (error) throw error;

      const transformed: AutomaticPromotion[] = (data || []).map((p: any) => ({
        id: p.id,
        companyId: p.company_id,
        pointsThreshold: p.points_threshold,
        rewardType: p.reward_type,
        rewardValue: p.reward_value,
        title: p.title,
        description: p.description,
        isActive: p.is_active,
        createdAt: p.created_at,
      }));

      setPromotions(transformed);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (data: {
    pointsThreshold: number;
    rewardType: string;
    rewardValue: string;
    title: string;
    description?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!company) return { success: false, error: "Empresa não encontrada" };

    try {
      const { error } = await supabase
        .from("automatic_promotions")
        .insert({
          company_id: company.id,
          points_threshold: data.pointsThreshold,
          reward_type: data.rewardType,
          reward_value: data.rewardValue,
          title: data.title,
          description: data.description,
        });

      if (error) throw error;

      await fetchPromotions();
      return { success: true };
    } catch (error: any) {
      console.error("Error creating promotion:", error);
      return { success: false, error: error.message };
    }
  };

  const updatePromotion = async (
    promotionId: string,
    data: Partial<{
      pointsThreshold: number;
      rewardType: string;
      rewardValue: string;
      title: string;
      description: string;
      isActive: boolean;
    }>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: any = {};
      if (data.pointsThreshold !== undefined) updateData.points_threshold = data.pointsThreshold;
      if (data.rewardType !== undefined) updateData.reward_type = data.rewardType;
      if (data.rewardValue !== undefined) updateData.reward_value = data.rewardValue;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { error } = await supabase
        .from("automatic_promotions")
        .update(updateData)
        .eq("id", promotionId);

      if (error) throw error;

      await fetchPromotions();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating promotion:", error);
      return { success: false, error: error.message };
    }
  };

  const deletePromotion = async (promotionId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("automatic_promotions")
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

  const checkAndAwardPromotions = async (
    fidelityCardId: string,
    userId: string,
    currentBalance: number,
    companyId: string
  ): Promise<EarnedPromotion[]> => {
    try {
      // Get active promotions for this company
      const { data: activePromotions, error: promError } = await supabase
        .from("automatic_promotions")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .lte("points_threshold", currentBalance);

      if (promError) throw promError;

      // Get already earned promotions for this card
      const { data: alreadyEarned, error: earnedError } = await supabase
        .from("earned_promotions")
        .select("promotion_id")
        .eq("fidelity_card_id", fidelityCardId);

      if (earnedError) throw earnedError;

      const earnedIds = new Set((alreadyEarned || []).map((e: any) => e.promotion_id));
      const newlyEarned: EarnedPromotion[] = [];

      // Award new promotions
      for (const promo of activePromotions || []) {
        if (!earnedIds.has(promo.id)) {
          const { data: inserted, error: insertError } = await supabase
            .from("earned_promotions")
            .insert({
              user_id: userId,
              fidelity_card_id: fidelityCardId,
              promotion_id: promo.id,
            })
            .select()
            .single();

          if (!insertError && inserted) {
            newlyEarned.push({
              id: inserted.id,
              userId: inserted.user_id,
              fidelityCardId: inserted.fidelity_card_id,
              promotionId: inserted.promotion_id,
              earnedAt: inserted.earned_at,
              isRedeemed: inserted.is_redeemed,
              promotion: {
                id: promo.id,
                companyId: promo.company_id,
                pointsThreshold: promo.points_threshold,
                rewardType: promo.reward_type as "discount" | "free_item" | "bonus_points",
                rewardValue: promo.reward_value,
                title: promo.title,
                description: promo.description,
                isActive: promo.is_active,
                createdAt: promo.created_at,
              },
            });
          }
        }
      }

      return newlyEarned;
    } catch (error) {
      console.error("Error checking promotions:", error);
      return [];
    }
  };

  const fetchEarnedPromotions = async (fidelityCardId?: string): Promise<EarnedPromotion[]> => {
    if (!user) return [];

    try {
      let query = supabase
        .from("earned_promotions")
        .select(`
          *,
          automatic_promotions (*)
        `)
        .eq("user_id", user.id);

      if (fidelityCardId) {
        query = query.eq("fidelity_card_id", fidelityCardId);
      }

      const { data, error } = await query.order("earned_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        fidelityCardId: e.fidelity_card_id,
        promotionId: e.promotion_id,
        earnedAt: e.earned_at,
        redeemedAt: e.redeemed_at,
        isRedeemed: e.is_redeemed,
        redemptionCode: e.redemption_code,
        pendingRedemption: e.pending_redemption,
        promotion: e.automatic_promotions ? {
          id: e.automatic_promotions.id,
          companyId: e.automatic_promotions.company_id,
          pointsThreshold: e.automatic_promotions.points_threshold,
          rewardType: e.automatic_promotions.reward_type as "discount" | "free_item" | "bonus_points",
          rewardValue: e.automatic_promotions.reward_value,
          title: e.automatic_promotions.title,
          description: e.automatic_promotions.description,
          isActive: e.automatic_promotions.is_active,
          createdAt: e.automatic_promotions.created_at,
        } : undefined,
      }));
    } catch (error) {
      console.error("Error fetching earned promotions:", error);
      return [];
    }
  };

  const redeemPromotion = async (earnedPromotionId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("earned_promotions")
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", earnedPromotionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Error redeeming promotion:", error);
      return { success: false, error: error.message };
    }
  };

  const requestRedemption = async (earnedPromotionId: string, redemptionCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("earned_promotions")
        .update({
          redemption_code: redemptionCode,
          pending_redemption: true,
        })
        .eq("id", earnedPromotionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Error requesting redemption:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    promotions,
    earnedPromotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    checkAndAwardPromotions,
    fetchEarnedPromotions,
    redeemPromotion,
    requestRedemption,
    refetch: fetchPromotions,
  };
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { TransactionToken } from "@/types/token";
import { useToast } from "./use-toast";

export const useTransactionToken = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateToken = async (
    cardId: string,
    actionType: 'add_points' | 'collect_reward'
  ): Promise<{ success: boolean; token?: TransactionToken; error?: string }> => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    setLoading(true);
    try {
      // Gerar token único
      const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Definir expiração em 30 segundos
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + 30);

      const { data, error } = await supabase
        .from('transaction_tokens')
        .insert({
          card_id: cardId,
          token,
          expires_at: expiresAt.toISOString(),
          action_type: actionType,
        })
        .select()
        .single();

      if (error) throw error;

      const tokenData: TransactionToken = {
        id: data.id,
        cardId: data.card_id,
        token: data.token,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        usedAt: data.used_at,
        isUsed: data.is_used,
        actionType: data.action_type as 'add_points' | 'collect_reward',
      };

      return { success: true, token: tokenData };
    } catch (error: any) {
      console.error("Error generating token:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (
    token: string
  ): Promise<{ success: boolean; tokenData?: TransactionToken; error?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaction_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;

      if (!data) {
        return { success: false, error: "Token inválido" };
      }

      // Verificar se já foi usado
      if (data.is_used) {
        return { success: false, error: "Token já foi utilizado" };
      }

      // Verificar expiração
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (now > expiresAt) {
        return { success: false, error: "Token expirado" };
      }

      const tokenData: TransactionToken = {
        id: data.id,
        cardId: data.card_id,
        token: data.token,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        usedAt: data.used_at,
        isUsed: data.is_used,
        actionType: data.action_type as 'add_points' | 'collect_reward',
      };

      return { success: true, tokenData };
    } catch (error: any) {
      console.error("Error validating token:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const markTokenAsUsed = async (
    tokenId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('transaction_tokens')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', tokenId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Error marking token as used:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    generateToken,
    validateToken,
    markTokenAsUsed,
    loading,
  };
};

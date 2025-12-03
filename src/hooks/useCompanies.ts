import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Company {
  id: string;
  name: string;
  shareCode: string;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  // SECURITY: pin_secret is NEVER exposed to the client
  // PIN validation happens server-side via Edge Function
}

export function useCompanies() {
  const { user, currentUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentUser?.accountType === 'business') {
      fetchMyCompany();
    } else {
      setCompany(null);
      setLoading(false);
    }
  }, [user, currentUser]);

  const fetchMyCompany = async () => {
    try {
      setLoading(true);
      // SECURITY: Only fetch non-sensitive columns
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, share_code, owner_id, created_at, updated_at")
        .eq("owner_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany({
          id: data.id,
          name: data.name,
          shareCode: data.share_code,
          ownerId: data.owner_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  const findCompanyByShareCode = async (shareCode: string): Promise<Company | null> => {
    try {
      // SECURITY: Use RPC function that excludes pin_secret
      const { data, error } = await supabase
        .rpc('find_company_by_share_code', { p_share_code: shareCode })
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          name: data.name,
          shareCode: data.share_code,
          ownerId: data.owner_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return null;
    } catch (error) {
      console.error("Error finding company:", error);
      return null;
    }
  };

  /**
   * SECURITY: PIN validation now happens server-side via Edge Function
   * The PIN is never exposed to or stored on the client
   */
  const validateCompanyPin = async (companyId: string, pin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-pin', {
        body: { companyId, pin }
      });

      if (error) {
        console.error("Error validating PIN:", error);
        return false;
      }

      return data?.valid === true;
    } catch (error) {
      console.error("Error validating PIN:", error);
      return false;
    }
  };

  const createCompany = async (name: string, shareCode: string, pinSecret: string = "1234") => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const { data, error } = await supabase
        .from("companies")
        .insert({
          name,
          share_code: shareCode.toUpperCase(),
          pin_secret: pinSecret,
          owner_id: user.id,
        })
        .select("id, name, share_code, owner_id, created_at, updated_at")
        .single();

      if (error) throw error;

      await fetchMyCompany();
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating company:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    company,
    loading,
    findCompanyByShareCode,
    validateCompanyPin,
    createCompany,
    refetch: fetchMyCompany,
  };
}

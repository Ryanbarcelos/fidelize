import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Company {
  id: string;
  name: string;
  shareCode: string;
  pinSecret: string;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
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
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany({
          id: data.id,
          name: data.name,
          shareCode: data.share_code,
          pinSecret: data.pin_secret,
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
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("share_code", shareCode.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          name: data.name,
          shareCode: data.share_code,
          pinSecret: data.pin_secret,
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

  const validateCompanyPin = async (companyId: string, pin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("pin_secret")
        .eq("id", companyId)
        .single();

      if (error) throw error;

      return data?.pin_secret === pin;
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
        .select()
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

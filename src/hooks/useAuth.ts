import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: "customer" | "business";
  storeName?: string;
  cnpj?: string;
  avatarUrl?: string;
}

interface BusinessDetails {
  storeName: string;
  cnpj?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
            
            if (profileData) {
              setCurrentUser({
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                accountType: profileData.account_type as "customer" | "business",
                storeName: profileData.store_name,
                cnpj: profileData.cnpj,
                avatarUrl: profileData.avatar_url,
              });
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData) {
              setCurrentUser({
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                accountType: profileData.account_type as "customer" | "business",
                storeName: profileData.store_name,
                cnpj: profileData.cnpj,
                avatarUrl: profileData.avatar_url,
              });
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    name: string,
    email: string,
    password: string,
    accountType: "customer" | "business" = "customer",
    businessDetails?: BusinessDetails
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            account_type: accountType,
            store_name: businessDetails?.storeName,
            cnpj: businessDetails?.cnpj,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    currentUser,
    user,
    session,
    isLoading,
    signUp,
    login,
    logout,
    isAuthenticated: !!user && !!currentUser,
  };
}

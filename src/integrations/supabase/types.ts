export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          card_id: string | null
          created_at: string | null
          device_info: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          latitude: number | null
          longitude: number | null
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          card_id?: string | null
          created_at?: string | null
          device_info?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          status: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          card_id?: string | null
          created_at?: string | null
          device_info?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      automatic_promotions: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          points_threshold: number
          reward_type: string
          reward_value: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          points_threshold: number
          reward_type?: string
          reward_value: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          points_threshold?: number
          reward_type?: string
          reward_value?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automatic_promotions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automatic_promotions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          pin_secret: string
          share_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          pin_secret?: string
          share_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          pin_secret?: string
          share_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      earned_promotions: {
        Row: {
          earned_at: string | null
          fidelity_card_id: string
          id: string
          is_redeemed: boolean
          pending_redemption: boolean | null
          promotion_id: string
          redeemed_at: string | null
          redemption_code: string | null
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          fidelity_card_id: string
          id?: string
          is_redeemed?: boolean
          pending_redemption?: boolean | null
          promotion_id: string
          redeemed_at?: string | null
          redemption_code?: string | null
          user_id: string
        }
        Update: {
          earned_at?: string | null
          fidelity_card_id?: string
          id?: string
          is_redeemed?: boolean
          pending_redemption?: boolean | null
          promotion_id?: string
          redeemed_at?: string | null
          redemption_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earned_promotions_fidelity_card_id_fkey"
            columns: ["fidelity_card_id"]
            isOneToOne: false
            referencedRelation: "fidelity_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earned_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "automatic_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      fidelity_cards: {
        Row: {
          balance: number | null
          company_id: string
          created_at: string | null
          id: string
          logo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          company_id: string
          created_at?: string | null
          id?: string
          logo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          company_id?: string
          created_at?: string | null
          id?: string
          logo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fidelity_cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fidelity_cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
        ]
      }
      fidelity_transactions: {
        Row: {
          balance_after: number
          company_id: string
          created_at: string | null
          created_by: string | null
          fidelity_card_id: string
          id: string
          points: number
          type: string
          user_id: string
        }
        Insert: {
          balance_after: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          fidelity_card_id: string
          id?: string
          points: number
          type: string
          user_id: string
        }
        Update: {
          balance_after?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          fidelity_card_id?: string
          id?: string
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fidelity_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fidelity_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fidelity_transactions_fidelity_card_id_fkey"
            columns: ["fidelity_card_id"]
            isOneToOne: false
            referencedRelation: "fidelity_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_cards: {
        Row: {
          card_number: string
          created_at: string
          id: string
          logo: string | null
          points: number
          store_name: string
          store_pin: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          card_number: string
          created_at?: string
          id?: string
          logo?: string | null
          points?: number
          store_name: string
          store_pin: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          card_number?: string
          created_at?: string
          id?: string
          logo?: string | null
          points?: number
          store_name?: string
          store_pin?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          description: string
          id: string
          image_url: string | null
          promotion_id: string
          read: boolean
          received_at: string
          store_id: string
          store_name: string
          title: string
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          image_url?: string | null
          promotion_id: string
          read?: boolean
          received_at?: string
          store_id: string
          store_name: string
          title: string
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          image_url?: string | null
          promotion_id?: string
          read?: boolean
          received_at?: string
          store_id?: string
          store_name?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          cnpj: string | null
          created_at: string
          email: string
          id: string
          name: string
          store_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          store_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          store_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean
          start_date: string
          store_id: string
          store_name: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date: string
          store_id: string
          store_name: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date?: string
          store_id?: string
          store_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_tokens: {
        Row: {
          action_type: string
          card_id: string
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          token: string
          used_at: string | null
        }
        Insert: {
          action_type: string
          card_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          token: string
          used_at?: string | null
        }
        Update: {
          action_type?: string
          card_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_tokens_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          card_id: string
          id: string
          points: number
          store_name: string
          timestamp: string
          type: string
          user_name: string | null
        }
        Insert: {
          card_id: string
          id?: string
          points: number
          store_name: string
          timestamp?: string
          type: string
          user_name?: string | null
        }
        Update: {
          card_id?: string
          id?: string
          points?: number
          store_name?: string
          timestamp?: string
          type?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "loyalty_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          completed: boolean
          completed_at: string | null
          current: number
          current_streak: number
          id: string
          last_access_date: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed?: boolean
          completed_at?: string | null
          current?: number
          current_streak?: number
          id?: string
          last_access_date?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed?: boolean
          completed_at?: string | null
          current?: number
          current_streak?: number
          id?: string
          last_access_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          current_xp: number
          id: string
          last_access_date: string | null
          medals: string[] | null
          total_rewards_collected: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          current_xp?: number
          id?: string
          last_access_date?: string | null
          medals?: string[] | null
          total_rewards_collected?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          current_xp?: number
          id?: string
          last_access_date?: string | null
          medals?: string[] | null
          total_rewards_collected?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      companies_public: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          owner_id: string | null
          share_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          owner_id?: string | null
          share_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          owner_id?: string | null
          share_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_company_by_share_code: {
        Args: { p_share_code: string }
        Returns: {
          created_at: string
          id: string
          name: string
          owner_id: string
          share_code: string
          updated_at: string
        }[]
      }
      generate_share_code: { Args: { store_name: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

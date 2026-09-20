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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          body_en: string
          body_zh: string
          cover_url: string
          created_at: string
          id: string
          position: number
          published: boolean
          published_at: string
          slug: string
          summary_en: string
          summary_zh: string
          tags: string[]
          title_en: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_zh?: string
          cover_url?: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          published_at?: string
          slug: string
          summary_en?: string
          summary_zh?: string
          tags?: string[]
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_zh?: string
          cover_url?: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          published_at?: string
          slug?: string
          summary_en?: string
          summary_zh?: string
          tags?: string[]
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_snapshots: {
        Row: {
          ciphertext: string
          created_at: string
          guest_session_id: string | null
          id: string
          identity_id: string | null
          name: string
          owner_user_id: string | null
        }
        Insert: {
          ciphertext?: string
          created_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          name?: string
          owner_user_id?: string | null
        }
        Update: {
          ciphertext?: string
          created_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          name?: string
          owner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloud_snapshots_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_snapshots_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_snapshots_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          client_version: string | null
          created_at: string
          device_public_key: string | null
          guest_session_id: string | null
          id: string
          identity_id: string | null
          last_seen_at: string
          name: string
          owner_user_id: string | null
          platform: string
          revoked_at: string | null
          status: string
        }
        Insert: {
          client_version?: string | null
          created_at?: string
          device_public_key?: string | null
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          last_seen_at?: string
          name?: string
          owner_user_id?: string | null
          platform?: string
          revoked_at?: string | null
          status?: string
        }
        Update: {
          client_version?: string | null
          created_at?: string
          device_public_key?: string | null
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          last_seen_at?: string
          name?: string
          owner_user_id?: string | null
          platform?: string
          revoked_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_pages: {
        Row: {
          body_en: string
          body_zh: string
          created_at: string
          id: string
          position: number
          published: boolean
          section_id: string | null
          slug: string
          summary_en: string
          summary_zh: string
          title_en: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_zh?: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          section_id?: string | null
          slug: string
          summary_en?: string
          summary_zh?: string
          title_en: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_zh?: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          section_id?: string | null
          slug?: string
          summary_en?: string
          summary_zh?: string
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doc_pages_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "doc_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_sections: {
        Row: {
          created_at: string
          id: string
          position: number
          slug: string
          title_en: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          slug: string
          title_en: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          slug?: string
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      guest_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          label: string | null
          last_seen_at: string
          token_hash: string
          upgraded_to: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string
          token_hash: string
          upgraded_to?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string
          token_hash?: string
          upgraded_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_sessions_upgraded_to_fkey"
            columns: ["upgraded_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_label: string | null
          id: string
          kind: string
          last_seen_at: string
          status: string
          upgraded_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          display_label?: string | null
          id?: string
          kind: string
          last_seen_at?: string
          status?: string
          upgraded_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          display_label?: string | null
          id?: string
          kind?: string
          last_seen_at?: string
          status?: string
          upgraded_at?: string | null
        }
        Relationships: []
      }
      identity_credentials: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          identity_id: string
          kind: string
          last_used_at: string | null
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          identity_id: string
          kind: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          identity_id?: string
          kind?: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_credentials_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      mesh_groups: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_identity_id: string | null
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          owner_identity_id?: string | null
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_identity_id?: string | null
          owner_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mesh_groups_owner_identity_id_fkey"
            columns: ["owner_identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesh_groups_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mesh_members: {
        Row: {
          created_at: string
          group_id: string
          guest_session_id: string | null
          id: string
          identity_id: string | null
          member_role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          member_role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          member_role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mesh_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "mesh_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesh_members_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesh_members_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesh_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      node_favorites: {
        Row: {
          created_at: string
          guest_session_id: string | null
          id: string
          identity_id: string | null
          label: string
          note: string | null
          owner_user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          label: string
          note?: string | null
          owner_user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          label?: string
          note?: string | null
          owner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_favorites_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_favorites_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_favorites_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pairing_codes: {
        Row: {
          claimed_at: string | null
          code: string
          created_at: string
          device_id: string | null
          expires_at: string
          guest_session_id: string | null
          id: string
          identity_id: string | null
          owner_user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          code: string
          created_at?: string
          device_id?: string | null
          expires_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          owner_user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          code?: string
          created_at?: string
          device_id?: string | null
          expires_at?: string
          guest_session_id?: string | null
          id?: string
          identity_id?: string | null
          owner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pairing_codes_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_codes_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_codes_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairing_codes_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          plan: string
          device_limit: number
          config_template_limit: number
          shared_vps_limit: number
          residential_ip_limit: number
          mesh_group_limit: number
          cloud_backup_limit: number
          updated_at: string
        }
        Insert: {
          plan: string
          device_limit: number
          config_template_limit?: number
          shared_vps_limit?: number
          residential_ip_limit?: number
          mesh_group_limit?: number
          cloud_backup_limit?: number
          updated_at?: string
        }
        Update: {
          plan?: string
          device_limit?: number
          config_template_limit?: number
          shared_vps_limit?: number
          residential_ip_limit?: number
          mesh_group_limit?: number
          cloud_backup_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_role: string
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          parent_account_id: string | null
          plan: string
          updated_at: string
        }
        Insert: {
          account_role?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          parent_account_id?: string | null
          plan?: string
          updated_at?: string
        }
        Update: {
          account_role?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          parent_account_id?: string | null
          plan?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

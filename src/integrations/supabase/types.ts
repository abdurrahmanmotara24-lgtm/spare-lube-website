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
      brands: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          logo: string | null
          name: string
          sort_order: number
          theme_accent_color: string | null
          theme_button_color: string | null
          theme_button_foreground_color: string | null
          theme_primary_color: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          image_url?: string | null
          logo?: string | null
          name: string
          sort_order?: number
          theme_accent_color?: string | null
          theme_button_color?: string | null
          theme_button_foreground_color?: string | null
          theme_primary_color?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          logo?: string | null
          name?: string
          sort_order?: number
          theme_accent_color?: string | null
          theme_button_color?: string | null
          theme_button_foreground_color?: string | null
          theme_primary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_team: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      operating_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          label: string
          notes: string | null
          open_time: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          label: string
          notes?: string | null
          open_time?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          label?: string
          notes?: string | null
          open_time?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pack_size_rules: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          size_id: string
          units_per_pack: number
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          size_id: string
          units_per_pack: number
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          size_id?: string
          units_per_pack?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_size_rules_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_size_rules_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          body_paragraph_1: string | null
          body_paragraph_2: string | null
          body_paragraph_3: string | null
          created_at: string
          eyebrow: string
          heading: string
          id: string
          subheading: string
          updated_at: string
        }
        Insert: {
          body_paragraph_1?: string | null
          body_paragraph_2?: string | null
          body_paragraph_3?: string | null
          created_at?: string
          eyebrow?: string
          heading?: string
          id: string
          subheading?: string
          updated_at?: string
        }
        Update: {
          body_paragraph_1?: string | null
          body_paragraph_2?: string | null
          body_paragraph_3?: string | null
          created_at?: string
          eyebrow?: string
          heading?: string
          id?: string
          subheading?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          sizes: string[]
          sort_order: number
          updated_at: string
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          sizes?: string[]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sizes?: string[]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_contact: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          contact_blurb: string | null
          created_at: string
          email: string | null
          id: string
          map_url: string | null
          phone: string
          updated_at: string
          whatsapp_phone: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_blurb?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          phone?: string
          updated_at?: string
          whatsapp_phone?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_blurb?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          phone?: string
          updated_at?: string
          whatsapp_phone?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string
          background_color: string
          button_color: string
          button_foreground_color: string
          created_at: string
          foreground_color: string
          hero_eyebrow: string
          hero_heading: string
          hero_image_url: string | null
          hero_overlay_opacity: number
          hero_subheading: string
          id: string
          primary_color: string
          secondary_color: string
          show_about: boolean
          show_contact: boolean
          show_order_list: boolean
          show_operating_hours: boolean
          show_weekly_specials: boolean
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          button_color?: string
          button_foreground_color?: string
          created_at?: string
          foreground_color?: string
          hero_eyebrow?: string
          hero_heading?: string
          hero_image_url?: string | null
          hero_overlay_opacity?: number
          hero_subheading?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          show_about?: boolean
          show_contact?: boolean
          show_order_list?: boolean
          show_operating_hours?: boolean
          show_weekly_specials?: boolean
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          button_color?: string
          button_foreground_color?: string
          created_at?: string
          foreground_color?: string
          hero_eyebrow?: string
          hero_heading?: string
          hero_image_url?: string | null
          hero_overlay_opacity?: number
          hero_subheading?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          show_about?: boolean
          show_contact?: boolean
          show_order_list?: boolean
          show_operating_hours?: boolean
          show_weekly_specials?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sizes: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      weekly_specials: {
        Row: {
          created_at: string
          custom_description: string | null
          header_label: string
          id: string
          is_active: boolean
          original_price: number | null
          product_id: string
          sort_order: number
          special_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          header_label?: string
          id?: string
          is_active?: boolean
          original_price?: number | null
          product_id: string
          sort_order?: number
          special_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          header_label?: string
          id?: string
          is_active?: boolean
          original_price?: number | null
          product_id?: string
          sort_order?: number
          special_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_specials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

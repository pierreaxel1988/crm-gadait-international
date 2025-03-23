export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      import_statistics: {
        Row: {
          created_at: string
          duplicates_count: number
          error_count: number
          id: string
          import_date: string
          imported_count: number
          source_type: string
          total_count: number
          updated_count: number
        }
        Insert: {
          created_at?: string
          duplicates_count?: number
          error_count: number
          id?: string
          import_date: string
          imported_count: number
          source_type: string
          total_count: number
          updated_count: number
        }
        Update: {
          created_at?: string
          duplicates_count?: number
          error_count?: number
          id?: string
          import_date?: string
          imported_count?: number
          source_type?: string
          total_count?: number
          updated_count?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          amenities: string[] | null
          assigned_to: string | null
          bedrooms: number | null
          budget: string | null
          budget_min: string | null
          country: string | null
          created_at: string
          desired_location: string | null
          email: string | null
          external_id: string | null
          financing_method: string | null
          id: string
          imported_at: string | null
          integration_source: string | null
          last_contacted_at: string | null
          living_area: string | null
          location: string | null
          name: string
          nationality: string | null
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          pipeline_type: string | null
          property_reference: string | null
          property_type: string | null
          property_use: string | null
          purchase_timeframe: string | null
          raw_data: Json | null
          source: string | null
          status: string
          tags: string[] | null
          task_type: string | null
          tax_residence: string | null
          url: string | null
          views: string[] | null
        }
        Insert: {
          amenities?: string[] | null
          assigned_to?: string | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          country?: string | null
          created_at?: string
          desired_location?: string | null
          email?: string | null
          external_id?: string | null
          financing_method?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          name: string
          nationality?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_type?: string | null
          property_reference?: string | null
          property_type?: string | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          source?: string | null
          status: string
          tags?: string[] | null
          task_type?: string | null
          tax_residence?: string | null
          url?: string | null
          views?: string[] | null
        }
        Update: {
          amenities?: string[] | null
          assigned_to?: string | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          country?: string | null
          created_at?: string
          desired_location?: string | null
          email?: string | null
          external_id?: string | null
          financing_method?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          name?: string
          nationality?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_type?: string | null
          property_reference?: string | null
          property_type?: string | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          source?: string | null
          status?: string
          tags?: string[] | null
          task_type?: string | null
          tax_residence?: string | null
          url?: string | null
          views?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: string[] | null
          area: number | null
          area_unit: string | null
          bathrooms: number | null
          bedrooms: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          features: string[] | null
          id: string
          images: string[] | null
          location: string | null
          price: number | null
          property_type: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          property_type?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          property_type?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      property_selections: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          id: string
          lead_id: string | null
          link_token: string | null
          link_visited_at: string | null
          name: string
          properties: string[]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          link_token?: string | null
          link_visited_at?: string | null
          name: string
          properties: string[]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          link_token?: string | null
          link_visited_at?: string | null
          name?: string
          properties?: string[]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_selections_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_team_member_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

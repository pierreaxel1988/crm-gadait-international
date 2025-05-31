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
      Gadait_Listings_Buy: {
        Row: {
          "Additional Image 1": string | null
          "Additional Image 10": string | null
          "Additional Image 2": string | null
          "Additional Image 3": string | null
          "Additional Image 4": string | null
          "Additional Image 5": string | null
          "Additional Image 6": string | null
          "Additional Image 7": string | null
          "Additional Image 8": string | null
          "Additional Image 9": string | null
          Area: string | null
          Bedrooms: number | null
          city: string | null
          country: string | null
          is_exclusive: boolean | null
          is_new: boolean | null
          "Main Image": string | null
          Position: number
          price: string | null
          "Price and Location": string | null
          "Property Link": string | null
          "Property Type": string | null
          "Secondary Image": string | null
          Title: string | null
        }
        Insert: {
          "Additional Image 1"?: string | null
          "Additional Image 10"?: string | null
          "Additional Image 2"?: string | null
          "Additional Image 3"?: string | null
          "Additional Image 4"?: string | null
          "Additional Image 5"?: string | null
          "Additional Image 6"?: string | null
          "Additional Image 7"?: string | null
          "Additional Image 8"?: string | null
          "Additional Image 9"?: string | null
          Area?: string | null
          Bedrooms?: number | null
          city?: string | null
          country?: string | null
          is_exclusive?: boolean | null
          is_new?: boolean | null
          "Main Image"?: string | null
          Position: number
          price?: string | null
          "Price and Location"?: string | null
          "Property Link"?: string | null
          "Property Type"?: string | null
          "Secondary Image"?: string | null
          Title?: string | null
        }
        Update: {
          "Additional Image 1"?: string | null
          "Additional Image 10"?: string | null
          "Additional Image 2"?: string | null
          "Additional Image 3"?: string | null
          "Additional Image 4"?: string | null
          "Additional Image 5"?: string | null
          "Additional Image 6"?: string | null
          "Additional Image 7"?: string | null
          "Additional Image 8"?: string | null
          "Additional Image 9"?: string | null
          Area?: string | null
          Bedrooms?: number | null
          city?: string | null
          country?: string | null
          is_exclusive?: boolean | null
          is_new?: boolean | null
          "Main Image"?: string | null
          Position?: number
          price?: string | null
          "Price and Location"?: string | null
          "Property Link"?: string | null
          "Property Type"?: string | null
          "Secondary Image"?: string | null
          Title?: string | null
        }
        Relationships: []
      }
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
      lead_ai_conversations: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          lead_id: string
          role: string
          sequence_order: number
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          lead_id: string
          role: string
          sequence_order: number
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          lead_id?: string
          role?: string
          sequence_order?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_ai_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_ai_history: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          prompt: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          prompt: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          prompt?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lead_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string | null
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          date: string
          gmail_message_id: string
          id: string
          is_sent: boolean
          lead_id: string
          recipient: string
          sender: string
          snippet: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          date: string
          gmail_message_id: string
          id?: string
          is_sent: boolean
          lead_id: string
          recipient: string
          sender: string
          snippet?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          date?: string
          gmail_message_id?: string
          id?: string
          is_sent?: boolean
          lead_id?: string
          recipient?: string
          sender?: string
          snippet?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          action_history: Json | null
          amenities: string[] | null
          assets: string[] | null
          assigned_to: string | null
          bedrooms: number | null
          budget: string | null
          budget_min: string | null
          condo_fees: string | null
          country: string | null
          created_at: string
          currency: string | null
          desired_location: string | null
          desired_price: string | null
          email: string | null
          email_envoye: boolean | null
          energy_class: string | null
          equipment: string[] | null
          external_id: string | null
          facilities: string[] | null
          fees: string | null
          financing_method: string | null
          floors: number | null
          furnished: boolean | null
          furniture_included_in_price: boolean | null
          furniture_price: string | null
          id: string
          imported_at: string | null
          integration_source: string | null
          key_features: string[] | null
          land_area: string | null
          last_contacted_at: string | null
          living_area: string | null
          location: string | null
          name: string
          nationality: string | null
          next_follow_up_date: string | null
          notes: string | null
          orientation: string[] | null
          parking_spaces: number | null
          phone: string | null
          phone_country_code: string | null
          phone_country_code_display: string | null
          pipeline_type: string
          preferred_language: string | null
          property_description: string | null
          property_reference: string | null
          property_type: string | null
          property_types: string[] | null
          property_use: string | null
          purchase_timeframe: string | null
          raw_data: Json | null
          regions: string[] | null
          renovation_needed: string | null
          salutation: string | null
          source: string | null
          status: string
          tags: string[] | null
          task_type: string | null
          tax_residence: string | null
          url: string | null
          views: string[] | null
          yearly_taxes: string | null
        }
        Insert: {
          action_history?: Json | null
          amenities?: string[] | null
          assets?: string[] | null
          assigned_to?: string | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          condo_fees?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          desired_location?: string | null
          desired_price?: string | null
          email?: string | null
          email_envoye?: boolean | null
          energy_class?: string | null
          equipment?: string[] | null
          external_id?: string | null
          facilities?: string[] | null
          fees?: string | null
          financing_method?: string | null
          floors?: number | null
          furnished?: boolean | null
          furniture_included_in_price?: boolean | null
          furniture_price?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          key_features?: string[] | null
          land_area?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          name: string
          nationality?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          orientation?: string[] | null
          parking_spaces?: number | null
          phone?: string | null
          phone_country_code?: string | null
          phone_country_code_display?: string | null
          pipeline_type: string
          preferred_language?: string | null
          property_description?: string | null
          property_reference?: string | null
          property_type?: string | null
          property_types?: string[] | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          regions?: string[] | null
          renovation_needed?: string | null
          salutation?: string | null
          source?: string | null
          status: string
          tags?: string[] | null
          task_type?: string | null
          tax_residence?: string | null
          url?: string | null
          views?: string[] | null
          yearly_taxes?: string | null
        }
        Update: {
          action_history?: Json | null
          amenities?: string[] | null
          assets?: string[] | null
          assigned_to?: string | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          condo_fees?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          desired_location?: string | null
          desired_price?: string | null
          email?: string | null
          email_envoye?: boolean | null
          energy_class?: string | null
          equipment?: string[] | null
          external_id?: string | null
          facilities?: string[] | null
          fees?: string | null
          financing_method?: string | null
          floors?: number | null
          furnished?: boolean | null
          furniture_included_in_price?: boolean | null
          furniture_price?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          key_features?: string[] | null
          land_area?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          name?: string
          nationality?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          orientation?: string[] | null
          parking_spaces?: number | null
          phone?: string | null
          phone_country_code?: string | null
          phone_country_code_display?: string | null
          pipeline_type?: string
          preferred_language?: string | null
          property_description?: string | null
          property_reference?: string | null
          property_type?: string | null
          property_types?: string[] | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          regions?: string[] | null
          renovation_needed?: string | null
          salutation?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          task_type?: string | null
          tax_residence?: string | null
          url?: string | null
          views?: string[] | null
          yearly_taxes?: string | null
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
      owner_actions: {
        Row: {
          action_date: string
          action_type: string
          completed_by: string | null
          completed_date: string | null
          created_by: string | null
          id: string
          notes: string | null
          owner_id: string
          scheduled_date: string | null
          status: string | null
        }
        Insert: {
          action_date?: string
          action_type: string
          completed_by?: string | null
          completed_date?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          scheduled_date?: string | null
          status?: string | null
        }
        Update: {
          action_date?: string
          action_type?: string
          completed_by?: string | null
          completed_date?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          scheduled_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_actions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_actions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_properties: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          property_id: string | null
          property_reference: string | null
          property_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          property_id?: string | null
          property_reference?: string | null
          property_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          property_id?: string | null
          property_reference?: string | null
          property_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          assigned_to: string | null
          attention_points: string | null
          contact_source: string | null
          created_at: string
          email: string | null
          first_contact_date: string | null
          full_name: string
          id: string
          last_contact_date: string | null
          mandate_type: string | null
          nationality: string | null
          next_action_date: string | null
          phone: string | null
          preferred_language: string | null
          relationship_details: string | null
          relationship_status: string | null
          specific_needs: string | null
          tax_residence: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attention_points?: string | null
          contact_source?: string | null
          created_at?: string
          email?: string | null
          first_contact_date?: string | null
          full_name: string
          id?: string
          last_contact_date?: string | null
          mandate_type?: string | null
          nationality?: string | null
          next_action_date?: string | null
          phone?: string | null
          preferred_language?: string | null
          relationship_details?: string | null
          relationship_status?: string | null
          specific_needs?: string | null
          tax_residence?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attention_points?: string | null
          contact_source?: string | null
          created_at?: string
          email?: string | null
          first_contact_date?: string | null
          full_name?: string
          id?: string
          last_contact_date?: string | null
          mandate_type?: string | null
          nationality?: string | null
          next_action_date?: string | null
          phone?: string | null
          preferred_language?: string | null
          relationship_details?: string | null
          relationship_status?: string | null
          specific_needs?: string | null
          tax_residence?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_assigned_to_fkey"
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
          criteria_label: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          id: string
          lead_id: string | null
          link_token: string | null
          link_visited_at: string | null
          name: string
          properties: string[]
          property_criteria: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criteria_label?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          link_token?: string | null
          link_visited_at?: string | null
          name: string
          properties: string[]
          property_criteria?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criteria_label?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          link_token?: string | null
          link_visited_at?: string | null
          name?: string
          properties?: string[]
          property_criteria?: Json | null
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
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean | null
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      user_email_connections: {
        Row: {
          access_token: string
          created_at: string
          email: string
          id: string
          provider: string
          refresh_token: string
          token_expiry: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          id?: string
          provider?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          id?: string
          provider?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_email_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          property_position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_position: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_position?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      get_current_team_member_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
          | { url: string; payload: Json; headers?: Json }
        Returns: Json
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_lead_bedrooms: {
        Args: { lead_id: string; bedroom_values: string }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

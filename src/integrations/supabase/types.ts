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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      amenities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      automated_email_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          min_budget: number | null
          name: string
          target_segments: Json
          total_clicked: number
          total_opened: number
          total_replied: number
          total_sent: number
          trigger_days: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_budget?: number | null
          name: string
          target_segments?: Json
          total_clicked?: number
          total_opened?: number
          total_replied?: number
          total_sent?: number
          trigger_days?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_budget?: number | null
          name?: string
          target_segments?: Json
          total_clicked?: number
          total_opened?: number
          total_replied?: number
          total_sent?: number
          trigger_days?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_email_logs: {
        Row: {
          action_id: string
          ai_generated_content: Json | null
          campaign_id: string
          clicked_at: string | null
          content_html: string
          created_at: string
          id: string
          lead_id: string
          opened_at: string | null
          personalization_data: Json | null
          recipient_email: string
          replied_at: string | null
          sent_at: string
          status: string
          subject: string
          template_id: string
          unsubscribed_at: string | null
        }
        Insert: {
          action_id: string
          ai_generated_content?: Json | null
          campaign_id: string
          clicked_at?: string | null
          content_html: string
          created_at?: string
          id?: string
          lead_id: string
          opened_at?: string | null
          personalization_data?: Json | null
          recipient_email: string
          replied_at?: string | null
          sent_at?: string
          status?: string
          subject: string
          template_id: string
          unsubscribed_at?: string | null
        }
        Update: {
          action_id?: string
          ai_generated_content?: Json | null
          campaign_id?: string
          clicked_at?: string | null
          content_html?: string
          created_at?: string
          id?: string
          lead_id?: string
          opened_at?: string | null
          personalization_data?: Json | null
          recipient_email?: string
          replied_at?: string | null
          sent_at?: string
          status?: string
          subject?: string
          template_id?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "automated_email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_email_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_data_entries: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          leads_count: number
          monthly_cost: number | null
          period_date: string | null
          period_name: string
          source_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          leads_count?: number
          monthly_cost?: number | null
          period_date?: string | null
          period_name: string
          source_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          leads_count?: number
          monthly_cost?: number | null
          period_date?: string | null
          period_name?: string
          source_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name: string
          symbol: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          symbol?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          symbol?: string | null
        }
        Relationships: []
      }
      custom_property_elements: {
        Row: {
          created_at: string
          created_by: string | null
          element_type: string
          id: string
          name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          element_type: string
          id?: string
          name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          element_type?: string
          id?: string
          name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_property_elements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          campaign_id: string
          content_template: string
          created_at: string
          day_number: number
          id: string
          is_active: boolean
          subject_template: string
          template_name: string
        }
        Insert: {
          campaign_id: string
          content_template: string
          created_at?: string
          day_number: number
          id?: string
          is_active?: boolean
          subject_template: string
          template_name: string
        }
        Update: {
          campaign_id?: string
          content_template?: string
          created_at?: string
          day_number?: number
          id?: string
          is_active?: boolean
          subject_template?: string
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "automated_email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          id: number
          rate_mur_to_eur: number
          rate_usd_to_eur: number
          updated_at: string
        }
        Insert: {
          id?: number
          rate_mur_to_eur: number
          rate_usd_to_eur: number
          updated_at?: string
        }
        Update: {
          id?: number
          rate_mur_to_eur?: number
          rate_usd_to_eur?: number
          updated_at?: string
        }
        Relationships: []
      }
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
      gadait_properties: {
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
          is_available: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          main_image: string | null
          price: number | null
          property_type: string | null
          scraped_at: string | null
          slug: string | null
          title: string
          updated_at: string | null
          url: string
          video_urls: string[] | null
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
          is_available?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_image?: string | null
          price?: number | null
          property_type?: string | null
          scraped_at?: string | null
          slug?: string | null
          title: string
          updated_at?: string | null
          url: string
          video_urls?: string[] | null
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
          is_available?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_image?: string | null
          price?: number | null
          property_type?: string | null
          scraped_at?: string | null
          slug?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          video_urls?: string[] | null
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
      lead_email_sequences: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_active: boolean
          last_activity_date: string | null
          last_activity_type: string | null
          lead_id: string
          next_email_date: string | null
          next_email_day: number | null
          sequence_started_at: string
          stopped_at: string | null
          stopped_by: string | null
          stopped_reason: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          last_activity_type?: string | null
          lead_id: string
          next_email_date?: string | null
          next_email_day?: number | null
          sequence_started_at?: string
          stopped_at?: string | null
          stopped_by?: string | null
          stopped_reason?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          last_activity_type?: string | null
          lead_id?: string
          next_email_date?: string | null
          next_email_day?: number | null
          sequence_started_at?: string
          stopped_at?: string | null
          stopped_by?: string | null
          stopped_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_email_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "automated_email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_email_sequences_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_email_sequences_stopped_by_fkey"
            columns: ["stopped_by"]
            isOneToOne: false
            referencedRelation: "team_members"
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
          attention_points: string | null
          bathrooms: number | null
          bedrooms: number | null
          budget: string | null
          budget_min: string | null
          commission_ht: string | null
          construction_year: string | null
          contact_source: string | null
          country: string | null
          created_at: string
          currency: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          desired_location: string | null
          desired_price: string | null
          email: string | null
          email_envoye: boolean | null
          equipment: string[] | null
          external_id: string | null
          fees: string | null
          financing_method: string | null
          first_contact_date: string | null
          furnished: boolean | null
          furniture_included_in_price: boolean | null
          furniture_price: string | null
          google_drive_link: string | null
          id: string
          imported_at: string | null
          integration_source: string | null
          internal_notes: string | null
          land_area: string | null
          last_contact_date: string | null
          last_contacted_at: string | null
          living_area: string | null
          location: string | null
          mandate_type: string | null
          map_coordinates: string | null
          name: string
          nationality: string | null
          next_action_date: string | null
          next_follow_up_date: string | null
          notes: string | null
          orientation: string[] | null
          phone: string | null
          phone_country_code: string | null
          phone_country_code_display: string | null
          pipeline_type: string
          preferred_language: string | null
          property_description: string | null
          property_reference: string | null
          property_state: string | null
          property_type: string | null
          property_types: string[] | null
          property_use: string | null
          purchase_timeframe: string | null
          raw_data: Json | null
          regions: string[] | null
          relationship_details: string | null
          relationship_status: string | null
          renovation_needed: boolean | null
          salutation: string | null
          source: string | null
          specific_needs: string | null
          status: string
          tags: string[] | null
          task_type: string | null
          tax_residence: string | null
          url: string | null
          views: string[] | null
        }
        Insert: {
          action_history?: Json | null
          amenities?: string[] | null
          assets?: string[] | null
          assigned_to?: string | null
          attention_points?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          commission_ht?: string | null
          construction_year?: string | null
          contact_source?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          desired_location?: string | null
          desired_price?: string | null
          email?: string | null
          email_envoye?: boolean | null
          equipment?: string[] | null
          external_id?: string | null
          fees?: string | null
          financing_method?: string | null
          first_contact_date?: string | null
          furnished?: boolean | null
          furniture_included_in_price?: boolean | null
          furniture_price?: string | null
          google_drive_link?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          internal_notes?: string | null
          land_area?: string | null
          last_contact_date?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          mandate_type?: string | null
          map_coordinates?: string | null
          name: string
          nationality?: string | null
          next_action_date?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          orientation?: string[] | null
          phone?: string | null
          phone_country_code?: string | null
          phone_country_code_display?: string | null
          pipeline_type: string
          preferred_language?: string | null
          property_description?: string | null
          property_reference?: string | null
          property_state?: string | null
          property_type?: string | null
          property_types?: string[] | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          regions?: string[] | null
          relationship_details?: string | null
          relationship_status?: string | null
          renovation_needed?: boolean | null
          salutation?: string | null
          source?: string | null
          specific_needs?: string | null
          status: string
          tags?: string[] | null
          task_type?: string | null
          tax_residence?: string | null
          url?: string | null
          views?: string[] | null
        }
        Update: {
          action_history?: Json | null
          amenities?: string[] | null
          assets?: string[] | null
          assigned_to?: string | null
          attention_points?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget?: string | null
          budget_min?: string | null
          commission_ht?: string | null
          construction_year?: string | null
          contact_source?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          desired_location?: string | null
          desired_price?: string | null
          email?: string | null
          email_envoye?: boolean | null
          equipment?: string[] | null
          external_id?: string | null
          fees?: string | null
          financing_method?: string | null
          first_contact_date?: string | null
          furnished?: boolean | null
          furniture_included_in_price?: boolean | null
          furniture_price?: string | null
          google_drive_link?: string | null
          id?: string
          imported_at?: string | null
          integration_source?: string | null
          internal_notes?: string | null
          land_area?: string | null
          last_contact_date?: string | null
          last_contacted_at?: string | null
          living_area?: string | null
          location?: string | null
          mandate_type?: string | null
          map_coordinates?: string | null
          name?: string
          nationality?: string | null
          next_action_date?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          orientation?: string[] | null
          phone?: string | null
          phone_country_code?: string | null
          phone_country_code_display?: string | null
          pipeline_type?: string
          preferred_language?: string | null
          property_description?: string | null
          property_reference?: string | null
          property_state?: string | null
          property_type?: string | null
          property_types?: string[] | null
          property_use?: string | null
          purchase_timeframe?: string | null
          raw_data?: Json | null
          regions?: string[] | null
          relationship_details?: string | null
          relationship_status?: string | null
          renovation_needed?: boolean | null
          salutation?: string | null
          source?: string | null
          specific_needs?: string | null
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
          {
            foreignKeyName: "leads_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      project_units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          floor_number: number | null
          garden_area: number | null
          id: string
          land_area: number | null
          orientation: string[] | null
          price: number | null
          project_id: string
          rooms: number | null
          specific_features: Json | null
          status: string
          surface: number | null
          terrace_area: number | null
          unit_reference: string
          unit_type: string
          updated_at: string
          view_type: string[] | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor_number?: number | null
          garden_area?: number | null
          id?: string
          land_area?: number | null
          orientation?: string[] | null
          price?: number | null
          project_id: string
          rooms?: number | null
          specific_features?: Json | null
          status?: string
          surface?: number | null
          terrace_area?: number | null
          unit_reference: string
          unit_type: string
          updated_at?: string
          view_type?: string[] | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor_number?: number | null
          garden_area?: number | null
          id?: string
          land_area?: number | null
          orientation?: string[] | null
          price?: number | null
          project_id?: string
          rooms?: number | null
          specific_features?: Json | null
          status?: string
          surface?: number | null
          terrace_area?: number | null
          unit_reference?: string
          unit_type?: string
          updated_at?: string
          view_type?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projets_backoffice"
            referencedColumns: ["id"]
          },
        ]
      }
      projets_backoffice: {
        Row: {
          access_info: string | null
          address: string | null
          amenities: string[] | null
          architect_name: string | null
          assigned_to: string | null
          available_units: number | null
          brochure_url: string | null
          building_permit_date: string | null
          building_permit_reference: string | null
          certifications: string[] | null
          commercialization_languages: string[] | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          delivery_date: string | null
          description: string | null
          developer_name: string | null
          estimated_charges: number | null
          estimated_notary_fees: number | null
          external_id: string | null
          features: string[] | null
          guarantees: string | null
          highlights: string[] | null
          id: string
          images: string[] | null
          investment_scheme: string | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          main_image: string | null
          marketing_tags: string[] | null
          masterplan_url: string | null
          meta_description: string | null
          meta_title: string | null
          other_documents: Json | null
          ownership_type: string | null
          payment_terms: string | null
          price_from: number | null
          price_list_url: string | null
          price_to: number | null
          project_phase: string | null
          project_status: string
          proximities: Json | null
          reference: string | null
          regulations: string[] | null
          reservation_fees: number | null
          residency_program: boolean | null
          seo_keywords: string[] | null
          slug: string | null
          status: string
          target_audience: string | null
          tax_benefits: string | null
          title: string
          total_units: number | null
          updated_at: string
          usp_points: Json | null
          video_urls: string[] | null
          virtual_tour: string | null
          visitor_parking: string | null
          warranty_info: string | null
          work_start_date: string | null
        }
        Insert: {
          access_info?: string | null
          address?: string | null
          amenities?: string[] | null
          architect_name?: string | null
          assigned_to?: string | null
          available_units?: number | null
          brochure_url?: string | null
          building_permit_date?: string | null
          building_permit_reference?: string | null
          certifications?: string[] | null
          commercialization_languages?: string[] | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          delivery_date?: string | null
          description?: string | null
          developer_name?: string | null
          estimated_charges?: number | null
          estimated_notary_fees?: number | null
          external_id?: string | null
          features?: string[] | null
          guarantees?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          investment_scheme?: string | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_image?: string | null
          marketing_tags?: string[] | null
          masterplan_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          other_documents?: Json | null
          ownership_type?: string | null
          payment_terms?: string | null
          price_from?: number | null
          price_list_url?: string | null
          price_to?: number | null
          project_phase?: string | null
          project_status?: string
          proximities?: Json | null
          reference?: string | null
          regulations?: string[] | null
          reservation_fees?: number | null
          residency_program?: boolean | null
          seo_keywords?: string[] | null
          slug?: string | null
          status?: string
          target_audience?: string | null
          tax_benefits?: string | null
          title: string
          total_units?: number | null
          updated_at?: string
          usp_points?: Json | null
          video_urls?: string[] | null
          virtual_tour?: string | null
          visitor_parking?: string | null
          warranty_info?: string | null
          work_start_date?: string | null
        }
        Update: {
          access_info?: string | null
          address?: string | null
          amenities?: string[] | null
          architect_name?: string | null
          assigned_to?: string | null
          available_units?: number | null
          brochure_url?: string | null
          building_permit_date?: string | null
          building_permit_reference?: string | null
          certifications?: string[] | null
          commercialization_languages?: string[] | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          delivery_date?: string | null
          description?: string | null
          developer_name?: string | null
          estimated_charges?: number | null
          estimated_notary_fees?: number | null
          external_id?: string | null
          features?: string[] | null
          guarantees?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          investment_scheme?: string | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          main_image?: string | null
          marketing_tags?: string[] | null
          masterplan_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          other_documents?: Json | null
          ownership_type?: string | null
          payment_terms?: string | null
          price_from?: number | null
          price_list_url?: string | null
          price_to?: number | null
          project_phase?: string | null
          project_status?: string
          proximities?: Json | null
          reference?: string | null
          regulations?: string[] | null
          reservation_fees?: number | null
          residency_program?: boolean | null
          seo_keywords?: string[] | null
          slug?: string | null
          status?: string
          target_audience?: string | null
          tax_benefits?: string | null
          title?: string
          total_units?: number | null
          updated_at?: string
          usp_points?: Json | null
          video_urls?: string[] | null
          virtual_tour?: string | null
          visitor_parking?: string | null
          warranty_info?: string | null
          work_start_date?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agent_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          city_id: string | null
          construction_status: boolean | null
          construction_year: number | null
          created_at: string | null
          currency_id: string | null
          datocms_id: string | null
          description: Json | null
          floors: number | null
          gatsby_preview: Json | null
          hide_price: boolean | null
          id: string
          land: number | null
          latitude: number | null
          longitude: number | null
          name: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          partner_name: string | null
          partner_url: string | null
          portals_hide: boolean | null
          postal_code: string | null
          price: number | null
          price_from: boolean | null
          property_status_id: string | null
          property_type_id: string | null
          reference: string | null
          rooms: number | null
          seo_description: string | null
          seo_image: string | null
          seo_title: string | null
          slug: string | null
          surface: number | null
          title: string
          updated_at: string | null
          video_thumbnail: string | null
          video_title: string | null
          video_url: string | null
          virtual_tour: string | null
          website_hide: boolean | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city_id?: string | null
          construction_status?: boolean | null
          construction_year?: number | null
          created_at?: string | null
          currency_id?: string | null
          datocms_id?: string | null
          description?: Json | null
          floors?: number | null
          gatsby_preview?: Json | null
          hide_price?: boolean | null
          id?: string
          land?: number | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          partner_name?: string | null
          partner_url?: string | null
          portals_hide?: boolean | null
          postal_code?: string | null
          price?: number | null
          price_from?: boolean | null
          property_status_id?: string | null
          property_type_id?: string | null
          reference?: string | null
          rooms?: number | null
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          slug?: string | null
          surface?: number | null
          title: string
          updated_at?: string | null
          video_thumbnail?: string | null
          video_title?: string | null
          video_url?: string | null
          virtual_tour?: string | null
          website_hide?: boolean | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city_id?: string | null
          construction_status?: boolean | null
          construction_year?: number | null
          created_at?: string | null
          currency_id?: string | null
          datocms_id?: string | null
          description?: Json | null
          floors?: number | null
          gatsby_preview?: Json | null
          hide_price?: boolean | null
          id?: string
          land?: number | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          partner_name?: string | null
          partner_url?: string | null
          portals_hide?: boolean | null
          postal_code?: string | null
          price?: number | null
          price_from?: boolean | null
          property_status_id?: string | null
          property_type_id?: string | null
          reference?: string | null
          rooms?: number | null
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          slug?: string | null
          surface?: number | null
          title?: string
          updated_at?: string | null
          video_thumbnail?: string | null
          video_title?: string | null
          video_url?: string | null
          virtual_tour?: string | null
          website_hide?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_status_id_fkey"
            columns: ["property_status_id"]
            isOneToOne: false
            referencedRelation: "property_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_backoffice: {
        Row: {
          address: string | null
          advanced_technologies: string[] | null
          amenities: string[] | null
          area: number | null
          area_unit: string | null
          assigned_to: string | null
          bathrooms: number | null
          bedrooms: number | null
          co2_emissions_class: string | null
          commission_percentage: number | null
          construction_status: string | null
          construction_year: number | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          documents: string[] | null
          energy_class: string | null
          external_id: string | null
          external_url: string | null
          features: string[] | null
          floor_number: number | null
          floor_plans: string[] | null
          floors: number | null
          garden_area: number | null
          has_elevator: boolean | null
          has_garden: boolean | null
          has_pool: boolean | null
          hide_price: boolean | null
          highlights: string[] | null
          id: string
          images: string[] | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          land_area: number | null
          land_area_unit: string | null
          latitude: number | null
          listing_type: string
          location: string | null
          location_privileges: string[] | null
          longitude: number | null
          main_image: string | null
          mandate_duration: string | null
          mandate_status: string | null
          meta_description: string | null
          meta_title: string | null
          monthly_charges: number | null
          orientation: string[] | null
          owner_email: string | null
          owner_first_name: string | null
          owner_id: string | null
          owner_name: string | null
          owner_notes: string | null
          owner_phone: string | null
          owner_phone_2: string | null
          parking_spaces: number | null
          parking_type: string | null
          partner_commission_ht: number | null
          partner_email: string | null
          partner_name: string | null
          partner_phone: string | null
          partner_property_url: string | null
          pool_details: string | null
          postal_code: string | null
          premium_services: string[] | null
          price: number | null
          price_eur: number | null
          price_from: number | null
          price_on_request: boolean | null
          property_condition: string | null
          property_type: string | null
          published_at: string | null
          reference: string | null
          resort_facilities: string[] | null
          rooms: number | null
          slug: string | null
          status: string
          surface: number | null
          tags: string[] | null
          terrace_area: number | null
          title: string
          updated_at: string
          video_urls: string[] | null
          view_type: string[] | null
          virtual_tour: string | null
        }
        Insert: {
          address?: string | null
          advanced_technologies?: string[] | null
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          co2_emissions_class?: string | null
          commission_percentage?: number | null
          construction_status?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents?: string[] | null
          energy_class?: string | null
          external_id?: string | null
          external_url?: string | null
          features?: string[] | null
          floor_number?: number | null
          floor_plans?: string[] | null
          floors?: number | null
          garden_area?: number | null
          has_elevator?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          hide_price?: boolean | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          land_area?: number | null
          land_area_unit?: string | null
          latitude?: number | null
          listing_type?: string
          location?: string | null
          location_privileges?: string[] | null
          longitude?: number | null
          main_image?: string | null
          mandate_duration?: string | null
          mandate_status?: string | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_charges?: number | null
          orientation?: string[] | null
          owner_email?: string | null
          owner_first_name?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_notes?: string | null
          owner_phone?: string | null
          owner_phone_2?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          partner_commission_ht?: number | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          partner_property_url?: string | null
          pool_details?: string | null
          postal_code?: string | null
          premium_services?: string[] | null
          price?: number | null
          price_eur?: number | null
          price_from?: number | null
          price_on_request?: boolean | null
          property_condition?: string | null
          property_type?: string | null
          published_at?: string | null
          reference?: string | null
          resort_facilities?: string[] | null
          rooms?: number | null
          slug?: string | null
          status?: string
          surface?: number | null
          tags?: string[] | null
          terrace_area?: number | null
          title: string
          updated_at?: string
          video_urls?: string[] | null
          view_type?: string[] | null
          virtual_tour?: string | null
        }
        Update: {
          address?: string | null
          advanced_technologies?: string[] | null
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          co2_emissions_class?: string | null
          commission_percentage?: number | null
          construction_status?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents?: string[] | null
          energy_class?: string | null
          external_id?: string | null
          external_url?: string | null
          features?: string[] | null
          floor_number?: number | null
          floor_plans?: string[] | null
          floors?: number | null
          garden_area?: number | null
          has_elevator?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          hide_price?: boolean | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          land_area?: number | null
          land_area_unit?: string | null
          latitude?: number | null
          listing_type?: string
          location?: string | null
          location_privileges?: string[] | null
          longitude?: number | null
          main_image?: string | null
          mandate_duration?: string | null
          mandate_status?: string | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_charges?: number | null
          orientation?: string[] | null
          owner_email?: string | null
          owner_first_name?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_notes?: string | null
          owner_phone?: string | null
          owner_phone_2?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          partner_commission_ht?: number | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          partner_property_url?: string | null
          pool_details?: string | null
          postal_code?: string | null
          premium_services?: string[] | null
          price?: number | null
          price_eur?: number | null
          price_from?: number | null
          price_on_request?: boolean | null
          property_condition?: string | null
          property_type?: string | null
          published_at?: string | null
          reference?: string | null
          resort_facilities?: string[] | null
          rooms?: number | null
          slug?: string | null
          status?: string
          surface?: number | null
          tags?: string[] | null
          terrace_area?: number | null
          title?: string
          updated_at?: string
          video_urls?: string[] | null
          view_type?: string[] | null
          virtual_tour?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_backoffice_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_backoffice_backup: {
        Row: {
          address: string | null
          advanced_technologies: string[] | null
          amenities: string[] | null
          area: number | null
          area_unit: string | null
          assigned_to: string | null
          bathrooms: number | null
          bedrooms: number | null
          co2_emissions_class: string | null
          commission_percentage: number | null
          construction_status: string | null
          construction_year: number | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          documents: string[] | null
          energy_class: string | null
          external_id: string | null
          external_url: string | null
          features: string[] | null
          floor_number: number | null
          floor_plans: string[] | null
          floors: number | null
          garden_area: number | null
          has_elevator: boolean | null
          has_garden: boolean | null
          has_pool: boolean | null
          hide_price: boolean | null
          highlights: string[] | null
          id: string
          images: string[] | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          land_area: number | null
          land_area_unit: string | null
          latitude: number | null
          listing_type: string
          location: string | null
          location_privileges: string[] | null
          longitude: number | null
          main_image: string | null
          mandate_duration: string | null
          mandate_status: string | null
          meta_description: string | null
          meta_title: string | null
          monthly_charges: number | null
          orientation: string[] | null
          owner_email: string | null
          owner_first_name: string | null
          owner_id: string | null
          owner_name: string | null
          owner_notes: string | null
          owner_phone: string | null
          owner_phone_2: string | null
          parking_spaces: number | null
          parking_type: string | null
          partner_commission_ht: number | null
          partner_email: string | null
          partner_name: string | null
          partner_phone: string | null
          partner_property_url: string | null
          pool_details: string | null
          postal_code: string | null
          premium_services: string[] | null
          price: number | null
          price_from: number | null
          price_on_request: boolean | null
          property_condition: string | null
          property_type: string | null
          published_at: string | null
          reference: string | null
          resort_facilities: string[] | null
          rooms: number | null
          slug: string | null
          status: string
          surface: number | null
          tags: string[] | null
          terrace_area: number | null
          title: string
          updated_at: string
          video_urls: string[] | null
          view_type: string[] | null
          virtual_tour: string | null
        }
        Insert: {
          address?: string | null
          advanced_technologies?: string[] | null
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          co2_emissions_class?: string | null
          commission_percentage?: number | null
          construction_status?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents?: string[] | null
          energy_class?: string | null
          external_id?: string | null
          external_url?: string | null
          features?: string[] | null
          floor_number?: number | null
          floor_plans?: string[] | null
          floors?: number | null
          garden_area?: number | null
          has_elevator?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          hide_price?: boolean | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          land_area?: number | null
          land_area_unit?: string | null
          latitude?: number | null
          listing_type: string
          location?: string | null
          location_privileges?: string[] | null
          longitude?: number | null
          main_image?: string | null
          mandate_duration?: string | null
          mandate_status?: string | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_charges?: number | null
          orientation?: string[] | null
          owner_email?: string | null
          owner_first_name?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_notes?: string | null
          owner_phone?: string | null
          owner_phone_2?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          partner_commission_ht?: number | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          partner_property_url?: string | null
          pool_details?: string | null
          postal_code?: string | null
          premium_services?: string[] | null
          price?: number | null
          price_from?: number | null
          price_on_request?: boolean | null
          property_condition?: string | null
          property_type?: string | null
          published_at?: string | null
          reference?: string | null
          resort_facilities?: string[] | null
          rooms?: number | null
          slug?: string | null
          status?: string
          surface?: number | null
          tags?: string[] | null
          terrace_area?: number | null
          title: string
          updated_at?: string
          video_urls?: string[] | null
          view_type?: string[] | null
          virtual_tour?: string | null
        }
        Update: {
          address?: string | null
          advanced_technologies?: string[] | null
          amenities?: string[] | null
          area?: number | null
          area_unit?: string | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          co2_emissions_class?: string | null
          commission_percentage?: number | null
          construction_status?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          documents?: string[] | null
          energy_class?: string | null
          external_id?: string | null
          external_url?: string | null
          features?: string[] | null
          floor_number?: number | null
          floor_plans?: string[] | null
          floors?: number | null
          garden_area?: number | null
          has_elevator?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          hide_price?: boolean | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          land_area?: number | null
          land_area_unit?: string | null
          latitude?: number | null
          listing_type?: string
          location?: string | null
          location_privileges?: string[] | null
          longitude?: number | null
          main_image?: string | null
          mandate_duration?: string | null
          mandate_status?: string | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_charges?: number | null
          orientation?: string[] | null
          owner_email?: string | null
          owner_first_name?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_notes?: string | null
          owner_phone?: string | null
          owner_phone_2?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          partner_commission_ht?: number | null
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          partner_property_url?: string | null
          pool_details?: string | null
          postal_code?: string | null
          premium_services?: string[] | null
          price?: number | null
          price_from?: number | null
          price_on_request?: boolean | null
          property_condition?: string | null
          property_type?: string | null
          published_at?: string | null
          reference?: string | null
          resort_facilities?: string[] | null
          rooms?: number | null
          slug?: string | null
          status?: string
          surface?: number | null
          tags?: string[] | null
          terrace_area?: number | null
          title?: string
          updated_at?: string
          video_urls?: string[] | null
          view_type?: string[] | null
          virtual_tour?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_backoffice_backup_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_backoffice_backup_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          created_at: string | null
          property_id: string
        }
        Insert: {
          amenity_id: string
          created_at?: string | null
          property_id: string
        }
        Update: {
          amenity_id?: string
          created_at?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_floor_plans: {
        Row: {
          created_at: string | null
          id: string
          property_external_id: string
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_external_id: string
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_external_id?: string
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt: string | null
          alt_text: string | null
          created_at: string | null
          datocms_id: string | null
          height: number | null
          id: string
          property_external_id: string
          seo_filename: string | null
          url: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          alt_text?: string | null
          created_at?: string | null
          datocms_id?: string | null
          height?: number | null
          id?: string
          property_external_id: string
          seo_filename?: string | null
          url?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          alt_text?: string | null
          created_at?: string | null
          datocms_id?: string | null
          height?: number | null
          id?: string
          property_external_id?: string
          seo_filename?: string | null
          url?: string | null
          width?: number | null
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
      property_statuses: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      property_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      public_criteria_links: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          filled_at: string | null
          id: string
          is_active: boolean
          lead_id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          filled_at?: string | null
          id?: string
          is_active?: boolean
          lead_id: string
          token?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          filled_at?: string | null
          id?: string
          is_active?: boolean
          lead_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_criteria_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_criteria_links_lead_id_fkey"
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
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          login_time: string
          logout_time: string | null
          session_duration: number | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          session_duration?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          session_duration?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      fx_latest: {
        Row: {
          rate_mur_to_eur: number | null
          rate_usd_to_eur: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      view_figaro_feed_mu_vente: {
        Row: {
          country: string | null
          cp: string | null
          descriptif: string | null
          id: string | null
          identifiant_agence: number | null
          images: string[] | null
          latitude: number | null
          longitude: number | null
          main_image: string | null
          nb_pieces: number | null
          precision_gps: number | null
          prix: number | null
          ref_agence: string | null
          surface: number | null
          type_annonce: string | null
          type_bien: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          country?: string | null
          cp?: never
          descriptif?: never
          id?: string | null
          identifiant_agence?: never
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          nb_pieces?: never
          precision_gps?: never
          prix?: number | null
          ref_agence?: never
          surface?: number | null
          type_annonce?: never
          type_bien?: never
          updated_at?: string | null
          ville?: never
        }
        Update: {
          country?: string | null
          cp?: never
          descriptif?: never
          id?: string | null
          identifiant_agence?: never
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          nb_pieces?: never
          precision_gps?: never
          prix?: number | null
          ref_agence?: never
          surface?: number | null
          type_annonce?: never
          type_bien?: never
          updated_at?: string | null
          ville?: never
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      close_stale_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          command: string
          database: string
          jobid: number
          jobname: string
          nodename: string
          nodeport: number
          schedule: string
          username: string
        }[]
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
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
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
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
          | { headers?: Json; payload: Json; url: string }
        Returns: Json
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
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
        Args: { bedroom_values: string; lead_id: string }
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

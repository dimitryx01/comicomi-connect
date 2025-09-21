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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      address_term_mappings: {
        Row: {
          basque_term: string | null
          catalan_term: string
          created_at: string
          galician_term: string | null
          id: string
          spanish_term: string
          term_type: string
        }
        Insert: {
          basque_term?: string | null
          catalan_term: string
          created_at?: string
          galician_term?: string | null
          id?: string
          spanish_term: string
          term_type: string
        }
        Update: {
          basque_term?: string | null
          catalan_term?: string
          created_at?: string
          galician_term?: string | null
          id?: string
          spanish_term?: string
          term_type?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_user_id: string
          expires_at: string
          id: string
          ip_address: string | null
          issued_at: string
          revoked: boolean
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          admin_user_id: string
          expires_at: string
          id?: string
          ip_address?: string | null
          issued_at?: string
          revoked?: boolean
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          issued_at?: string
          revoked?: boolean
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_user_roles: {
        Row: {
          admin_user_id: string
          assigned_at: string
          assigned_by: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          admin_user_id: string
          assigned_at?: string
          assigned_by: string
          id?: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          admin_user_id?: string
          assigned_at?: string
          assigned_by?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_user_roles_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      cheers: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cheers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cheers_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cheers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          autonomous_community: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          municipality: string
          province: string
          search_terms: string[] | null
          updated_at: string
        }
        Insert: {
          autonomous_community: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality: string
          province: string
          search_terms?: string[] | null
          updated_at?: string
        }
        Update: {
          autonomous_community?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality?: string
          province?: string
          search_terms?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      comment_cheers: {
        Row: {
          comment_id: string | null
          comment_type: Database["public"]["Enums"]["comment_type"] | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          comment_type?: Database["public"]["Enums"]["comment_type"] | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          comment_type?: Database["public"]["Enums"]["comment_type"] | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_cheers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string | null
          recipe_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cuisines: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      interest_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          autonomous_community: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          municipality: string
          postal_code: string | null
          province: string
          search_terms: string[] | null
          updated_at: string
        }
        Insert: {
          autonomous_community: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality: string
          postal_code?: string | null
          province: string
          search_terms?: string[] | null
          updated_at?: string
        }
        Update: {
          autonomous_community?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality?: string
          postal_code?: string | null
          province?: string
          search_terms?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      measurement_units: {
        Row: {
          category: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      message_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_notes: string | null
          action_type: string
          admin_user_id: string
          author_id: string | null
          content_id: string
          content_snapshot: Json | null
          content_type: string
          created_at: string
          id: string
          new_state: Json | null
          previous_state: Json | null
          reason_code: string | null
          report_ids: string[]
        }
        Insert: {
          action_notes?: string | null
          action_type: string
          admin_user_id: string
          author_id?: string | null
          content_id: string
          content_snapshot?: Json | null
          content_type: string
          created_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason_code?: string | null
          report_ids: string[]
        }
        Update: {
          action_notes?: string | null
          action_type?: string
          admin_user_id?: string
          author_id?: string | null
          content_id?: string
          content_snapshot?: Json | null
          content_type?: string
          created_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason_code?: string | null
          report_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_reason_code_fkey"
            columns: ["reason_code"]
            isOneToOne: false
            referencedRelation: "moderation_reasons"
            referencedColumns: ["code"]
          },
        ]
      }
      moderation_reasons: {
        Row: {
          active: boolean
          category: string | null
          code: string
          created_at: string
          description: string | null
          label: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          label: string
        }
        Update: {
          active?: boolean
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          label?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_codes: {
        Row: {
          area_name: string | null
          city_id: string
          created_at: string
          id: string
          is_active: boolean
          postal_code: string
        }
        Insert: {
          area_name?: string | null
          city_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          postal_code: string
        }
        Update: {
          area_name?: string | null
          city_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          postal_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "postal_codes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          is_reported: boolean
          location: string | null
          media_urls: Json | null
          post_type: string | null
          recipe_id: string | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          is_reported?: boolean
          location?: string | null
          media_urls?: Json | null
          post_type?: string | null
          recipe_id?: string | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          is_reported?: boolean
          location?: string | null
          media_urls?: Json | null
          post_type?: string | null
          recipe_id?: string | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_cheers: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_cheers_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_cheers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: string[] | null
          author_id: string | null
          cook_time: number | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          is_public: boolean | null
          is_reported: boolean
          prep_time: number | null
          recipe_interests: string[] | null
          servings: number | null
          steps: Json | null
          tags: string[] | null
          title: string
          total_time: number | null
          updated_at: string | null
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          allergens?: string[] | null
          author_id?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          is_public?: boolean | null
          is_reported?: boolean
          prep_time?: number | null
          recipe_interests?: string[] | null
          servings?: number | null
          steps?: Json | null
          tags?: string[] | null
          title: string
          total_time?: number | null
          updated_at?: string | null
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          allergens?: string[] | null
          author_id?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          is_public?: boolean | null
          is_reported?: boolean
          prep_time?: number | null
          recipe_interests?: string[] | null
          servings?: number | null
          steps?: Json | null
          tags?: string[] | null
          title?: string
          total_time?: number | null
          updated_at?: string | null
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          comment_id: string | null
          created_at: string | null
          description: string | null
          id: string
          post_id: string | null
          recipe_id: string | null
          report_type: string | null
          reported_user_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          restaurant_id: string | null
          review_id: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          recipe_id?: string | null
          report_type?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          review_id?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          recipe_id?: string | null
          report_type?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          review_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "restaurant_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_access_actions: {
        Row: {
          action_notes: string | null
          action_type: string
          admin_user_id: string
          created_at: string
          documents_uploaded: Json | null
          id: string
          new_status: string | null
          previous_status: string | null
          request_id: string
          restaurant_id: string
          target_user_id: string
        }
        Insert: {
          action_notes?: string | null
          action_type: string
          admin_user_id: string
          created_at?: string
          documents_uploaded?: Json | null
          id?: string
          new_status?: string | null
          previous_status?: string | null
          request_id: string
          restaurant_id: string
          target_user_id: string
        }
        Update: {
          action_notes?: string | null
          action_type?: string
          admin_user_id?: string
          created_at?: string
          documents_uploaded?: Json | null
          id?: string
          new_status?: string | null
          previous_status?: string | null
          request_id?: string
          restaurant_id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_access_actions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "restaurant_admin_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_admin_requests: {
        Row: {
          created_at: string
          dni_scan_url: string | null
          email: string
          full_name: string
          id: string
          legal_name: string
          moderated_at: string | null
          moderated_by_admin_id: string | null
          moderation_notes: string | null
          ownership_proof_url: string | null
          phone: string
          requester_user_id: string
          restaurant_id: string
          selfie_url: string | null
          status: string
          tax_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dni_scan_url?: string | null
          email: string
          full_name: string
          id?: string
          legal_name: string
          moderated_at?: string | null
          moderated_by_admin_id?: string | null
          moderation_notes?: string | null
          ownership_proof_url?: string | null
          phone: string
          requester_user_id: string
          restaurant_id: string
          selfie_url?: string | null
          status?: string
          tax_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dni_scan_url?: string | null
          email?: string
          full_name?: string
          id?: string
          legal_name?: string
          moderated_at?: string | null
          moderated_by_admin_id?: string | null
          moderation_notes?: string | null
          ownership_proof_url?: string | null
          phone?: string
          requester_user_id?: string
          restaurant_id?: string
          selfie_url?: string | null
          status?: string
          tax_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_admins: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_admins_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_cuisines: {
        Row: {
          created_at: string
          cuisine_id: string
          id: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          cuisine_id: string
          id?: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          cuisine_id?: string
          id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_cuisines_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_cuisines_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reviews: {
        Row: {
          ambiance_rating: number | null
          cleanliness_rating: number | null
          comment: string | null
          created_at: string | null
          food_quality_rating: number | null
          id: string
          overall_rating: number | null
          restaurant_id: string | null
          service_rating: number | null
          updated_at: string | null
          user_id: string | null
          value_rating: number | null
          visit_date: string | null
        }
        Insert: {
          ambiance_rating?: number | null
          cleanliness_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_quality_rating?: number | null
          id?: string
          overall_rating?: number | null
          restaurant_id?: string | null
          service_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          value_rating?: number | null
          visit_date?: string | null
        }
        Update: {
          ambiance_rating?: number | null
          cleanliness_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_quality_rating?: number | null
          id?: string
          overall_rating?: number | null
          restaurant_id?: string | null
          service_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          value_rating?: number | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          location: string | null
          location_id: string | null
          name: string
          owner_id: string | null
          phone: string | null
          street_address: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          location_id?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          location_id?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_cheers: {
        Row: {
          created_at: string | null
          id: string
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_cheers_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "restaurant_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_cheers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_recipes: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_restaurants: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_restaurants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_shared_posts: {
        Row: {
          created_at: string
          id: string
          shared_post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shared_post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shared_post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_post_cheers: {
        Row: {
          created_at: string
          id: string
          shared_post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shared_post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shared_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_post_cheers_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "shared_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          shared_post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          shared_post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          shared_post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "shared_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_post_comments_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "shared_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_posts: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          shared_post_id: string | null
          shared_recipe_id: string | null
          shared_restaurant_id: string | null
          shared_type: string
          sharer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          shared_post_id?: string | null
          shared_recipe_id?: string | null
          shared_restaurant_id?: string | null
          shared_type: string
          sharer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          shared_post_id?: string | null
          shared_recipe_id?: string | null
          shared_restaurant_id?: string | null
          shared_type?: string
          sharer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_posts_sharer_id_fkey"
            columns: ["sharer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          created_at: string | null
          id: string
          ingredient_name: string
          is_checked: boolean | null
          quantity: string | null
          recipe_id: string | null
          shopping_list_id: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_name: string
          is_checked?: boolean | null
          quantity?: string | null
          recipe_id?: string | null
          shopping_list_id?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_name?: string
          is_checked?: boolean | null
          quantity?: string | null
          recipe_id?: string | null
          shopping_list_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          name: string | null
          recipe_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string | null
          recipe_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_followers: {
        Row: {
          created_at: string | null
          followed_id: string | null
          follower_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          followed_id?: string | null
          follower_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string | null
          follower_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          followed_restaurant_id: string | null
          followed_user_id: string | null
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_restaurant_id?: string | null
          followed_user_id?: string | null
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_restaurant_id?: string | null
          followed_user_id?: string | null
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_followed_restaurant_id_fkey"
            columns: ["followed_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_message_preferences: {
        Row: {
          allow_messages: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_messages?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_messages?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cooking_level: string | null
          country: string | null
          created_at: string | null
          dietary_restrictions: string[] | null
          email: string | null
          favorite_cuisines: string[] | null
          first_name: string | null
          full_name: string | null
          home_location_id: string | null
          id: string
          is_verified: boolean | null
          last_name: string | null
          location: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cooking_level?: string | null
          country?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          favorite_cuisines?: string[] | null
          first_name?: string | null
          full_name?: string | null
          home_location_id?: string | null
          id: string
          is_verified?: boolean | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cooking_level?: string | null
          country?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          favorite_cuisines?: string[] | null
          first_name?: string | null
          full_name?: string | null
          home_location_id?: string | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_home_location_id_fkey"
            columns: ["home_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_restaurant_access: {
        Args:
          | {
              dni_file_id: string
              notes?: string
              ownership_file_id: string
              p_admin_user_id?: string
              request_id: string
              selfie_file_id: string
            }
          | {
              dni_file_id: string
              notes?: string
              ownership_file_id: string
              request_id: string
              selfie_file_id: string
            }
        Returns: boolean
      }
      admin_reject_restaurant_access: {
        Args:
          | { notes: string; p_admin_user_id?: string; request_id: string }
          | { notes: string; request_id: string }
        Returns: boolean
      }
      admin_revoke_restaurant_access: {
        Args:
          | { notes: string; p_admin_user_id?: string; request_id: string }
          | { notes: string; request_id: string }
        Returns: boolean
      }
      authenticate_admin_user: {
        Args: { user_email: string; user_password: string }
        Returns: {
          email: string
          full_name: string
          id: string
          roles: Database["public"]["Enums"]["admin_role"][]
        }[]
      }
      can_send_message: {
        Args: { receiver_uuid: string; sender_uuid: string }
        Returns: boolean
      }
      can_user_request_restaurant_access: {
        Args: { p_restaurant_id: string; p_user_id: string }
        Returns: boolean
      }
      check_admin_role: {
        Args: {
          required_role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Returns: boolean
      }
      count_restaurant_followers: {
        Args: { restaurant_uuid: string }
        Returns: number
      }
      count_user_followers: {
        Args: { target_user_id: string }
        Returns: number
      }
      count_user_following: {
        Args: { user_uuid: string }
        Returns: number
      }
      create_admin_user: {
        Args:
          | {
              assigned_by_id: string
              user_email: string
              user_full_name: string
              user_password: string
              user_roles: Database["public"]["Enums"]["admin_role"][]
            }
          | {
              user_email: string
              user_full_name: string
              user_password: string
              user_roles: Database["public"]["Enums"]["admin_role"][]
            }
        Returns: string
      }
      create_notification: {
        Args: {
          p_actor_id: string
          p_message?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      delete_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_admin_audit_logs: {
        Args: {
          p_action?: string
          p_admin_user_id?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_target_type?: string
        }
        Returns: {
          action: string
          admin_name: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          target_id: string
          target_type: string
        }[]
      }
      get_admin_user_roles: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"][]
      }
      get_all_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string
          roles: Database["public"]["Enums"]["admin_role"][]
        }[]
      }
      get_conversation_messages: {
        Args: {
          page_limit?: number
          page_offset?: number
          partner_uuid: string
          user_uuid: string
        }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_avatar: string
          sender_id: string
          sender_name: string
          sender_username: string
          text: string
        }[]
      }
      get_cuisines: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          slug: string
          sort_order: number
        }[]
      }
      get_grouped_reports: {
        Args: Record<PropertyKey, never>
        Returns: {
          content_id: string
          content_type: string
          first_report_at: string
          has_moderation_action: boolean
          last_report_at: string
          priority_level: string
          report_count: number
          report_ids: string[]
          report_types: string[]
          reporter_ids: string[]
          statuses: string[]
        }[]
      }
      get_location_by_coordinates: {
        Args: { lat: number; lng: number; radius_km?: number }
        Returns: {
          autonomous_community: string
          distance_km: number
          id: string
          municipality: string
          province: string
        }[]
      }
      get_measurement_units: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          code: string
          id: string
          name: string
          sort_order: number
        }[]
      }
      get_moderation_history: {
        Args: { p_content_id: string; p_content_type: string }
        Returns: {
          action_notes: string
          action_type: string
          admin_name: string
          admin_user_id: string
          created_at: string
          id: string
          new_state: Json
          previous_state: Json
          reason_code: string
          reason_label: string
        }[]
      }
      get_personalized_unified_feed: {
        Args: { page_offset?: number; page_size?: number; user_uuid: string }
        Returns: {
          content_data: Json
          content_id: string
          content_type: string
          created_at: string
          relevance_score: number
        }[]
      }
      get_post_comments: {
        Args: { post_uuid: string }
        Returns: {
          cheers_count: number
          content: string
          created_at: string
          id: string
          user_avatar_url: string
          user_full_name: string
          user_id: string
          user_username: string
        }[]
      }
      get_post_comments_count: {
        Args: { post_uuid: string }
        Returns: number
      }
      get_postal_codes_for_city: {
        Args: { city_id_param: string }
        Returns: {
          area_name: string
          postal_code: string
        }[]
      }
      get_random_restaurants_by_city: {
        Args: { limit_count?: number; user_city: string }
        Returns: {
          cover_image_url: string
          cuisine_type: string
          description: string
          followers_count: number
          id: string
          image_url: string
          location: string
          name: string
        }[]
      }
      get_random_restaurants_by_location: {
        Args: { limit_count?: number; location_id_param: string }
        Returns: {
          cover_image_url: string
          cuisine_type: string
          description: string
          followers_count: number
          id: string
          image_url: string
          location_name: string
          name: string
        }[]
      }
      get_recipe_by_id: {
        Args: { recipe_uuid: string }
        Returns: {
          allergens: string[]
          author_avatar_url: string
          author_id: string
          author_name: string
          author_username: string
          cheers_count: number
          comments_count: number
          cook_time: number
          created_at: string
          cuisine_type: string
          description: string
          difficulty: string
          id: string
          image_url: string
          ingredients: Json
          prep_time: number
          recipe_interests: string[]
          saves_count: number
          servings: number
          steps: Json
          tags: string[]
          title: string
          total_time: number
          youtube_url: string
        }[]
      }
      get_recipe_comments: {
        Args: { recipe_uuid: string }
        Returns: {
          cheers_count: number
          content: string
          created_at: string
          id: string
          user_avatar_url: string
          user_full_name: string
          user_id: string
          user_username: string
        }[]
      }
      get_recipe_comments_count: {
        Args: { recipe_uuid: string }
        Returns: number
      }
      get_recipes_with_author_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          allergens: string[]
          author_avatar_url: string
          author_id: string
          author_name: string
          author_username: string
          cheers_count: number
          cook_time: number
          created_at: string
          cuisine_type: string
          description: string
          difficulty: string
          id: string
          image_url: string
          ingredients: Json
          prep_time: number
          recipe_interests: string[]
          saves_count: number
          servings: number
          steps: Json
          tags: string[]
          title: string
          total_time: number
          youtube_url: string
        }[]
      }
      get_reported_content_details: {
        Args: { p_content_id: string; p_content_type: string }
        Returns: Json
      }
      get_restaurant_cuisine_types: {
        Args: { restaurant_uuid: string }
        Returns: string[]
      }
      get_restaurants_by_cuisine: {
        Args: { cuisine_names: string[] }
        Returns: {
          cuisine_types: string[]
          description: string
          id: string
          location: string
          name: string
        }[]
      }
      get_shared_post_comments: {
        Args: { shared_post_uuid: string }
        Returns: {
          cheers_count: number
          content: string
          created_at: string
          id: string
          user_avatar_url: string
          user_full_name: string
          user_id: string
          user_username: string
        }[]
      }
      get_shared_post_comments_count: {
        Args: { shared_post_uuid: string }
        Returns: number
      }
      get_unread_notifications_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_user_conversations: {
        Args: { user_uuid: string }
        Returns: {
          conversation_partner_avatar: string
          conversation_partner_id: string
          conversation_partner_name: string
          conversation_partner_username: string
          is_sender: boolean
          last_message_text: string
          last_message_time: string
          unread_count: number
        }[]
      }
      get_user_notifications: {
        Args: {
          page_limit?: number
          page_offset?: number
          target_user_id: string
        }
        Returns: {
          actor_avatar: string
          actor_id: string
          actor_name: string
          actor_username: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string
          related_entity_type: string
          type: string
        }[]
      }
      is_admin_master: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_following_restaurant: {
        Args: { follower_uuid: string; restaurant_uuid: string }
        Returns: boolean
      }
      is_following_user: {
        Args: { follower_uuid: string; target_user_id: string }
        Returns: boolean
      }
      is_valid_admin_user: {
        Args: { admin_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_admin_user_id: string
          p_details?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: string
      }
      log_restaurant_access_action: {
        Args: {
          p_action_notes?: string
          p_action_type: string
          p_admin_user_id: string
          p_documents_uploaded?: Json
          p_new_status?: string
          p_previous_status?: string
          p_request_id: string
          p_restaurant_id: string
          p_target_user_id: string
        }
        Returns: string
      }
      search_cities_intelligent: {
        Args: { p_limit?: number; search_query: string }
        Returns: {
          autonomous_community: string
          full_location: string
          id: string
          municipality: string
          province: string
          relevance_score: number
        }[]
      }
      search_locations_intelligent: {
        Args: { p_limit?: number; search_query: string }
        Returns: {
          autonomous_community: string
          full_location: string
          id: string
          municipality: string
          postal_code: string
          province: string
          relevance_score: number
        }[]
      }
      test_notification_creation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      toggle_admin_user_status: {
        Args: { is_active: boolean; user_id: string }
        Returns: boolean
      }
      update_admin_user: {
        Args: {
          updated_by_id: string
          user_email: string
          user_full_name: string
          user_id: string
          user_roles: Database["public"]["Enums"]["admin_role"][]
        }
        Returns: boolean
      }
      validate_postal_code_for_city: {
        Args: { city_id_param: string; postal_code_param: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role:
        | "admin_master"
        | "moderador_contenido"
        | "gestor_establecimientos"
        | "soporte_tecnico"
      comment_type: "post_comment" | "recipe_comment" | "shared_post_comment"
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
    Enums: {
      admin_role: [
        "admin_master",
        "moderador_contenido",
        "gestor_establecimientos",
        "soporte_tecnico",
      ],
      comment_type: ["post_comment", "recipe_comment", "shared_post_comment"],
    },
  },
} as const

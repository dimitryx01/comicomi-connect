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
      comment_cheers: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_cheers_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string | null
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
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
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
          name: string
          owner_id: string | null
          phone: string | null
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
          name: string
          owner_id?: string | null
          phone?: string | null
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
          name?: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
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
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_send_message: {
        Args: { sender_uuid: string; receiver_uuid: string }
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
      get_conversation_messages: {
        Args: {
          user_uuid: string
          partner_uuid: string
          page_limit?: number
          page_offset?: number
        }
        Returns: {
          id: string
          sender_id: string
          receiver_id: string
          text: string
          created_at: string
          is_read: boolean
          sender_name: string
          sender_username: string
          sender_avatar: string
        }[]
      }
      get_personalized_unified_feed: {
        Args: { user_uuid: string; page_size?: number; page_offset?: number }
        Returns: {
          content_type: string
          content_id: string
          content_data: Json
          relevance_score: number
          created_at: string
        }[]
      }
      get_post_comments: {
        Args: { post_uuid: string }
        Returns: {
          id: string
          content: string
          created_at: string
          user_id: string
          user_full_name: string
          user_username: string
          user_avatar_url: string
          cheers_count: number
        }[]
      }
      get_post_comments_count: {
        Args: { post_uuid: string }
        Returns: number
      }
      get_random_restaurants_by_city: {
        Args: { user_city: string; limit_count?: number }
        Returns: {
          id: string
          name: string
          description: string
          image_url: string
          cover_image_url: string
          location: string
          cuisine_type: string
          followers_count: number
        }[]
      }
      get_recipe_by_id: {
        Args: { recipe_uuid: string }
        Returns: {
          id: string
          title: string
          description: string
          image_url: string
          youtube_url: string
          author_id: string
          author_name: string
          author_username: string
          author_avatar_url: string
          prep_time: number
          cook_time: number
          total_time: number
          servings: number
          cuisine_type: string
          difficulty: string
          ingredients: Json
          steps: Json
          allergens: string[]
          tags: string[]
          recipe_interests: string[]
          created_at: string
          cheers_count: number
          saves_count: number
          comments_count: number
        }[]
      }
      get_recipe_comments: {
        Args: { recipe_uuid: string }
        Returns: {
          id: string
          content: string
          created_at: string
          user_id: string
          user_full_name: string
          user_username: string
          user_avatar_url: string
          cheers_count: number
        }[]
      }
      get_recipe_comments_count: {
        Args: { recipe_uuid: string }
        Returns: number
      }
      get_recipes_with_author_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          image_url: string
          youtube_url: string
          author_id: string
          author_name: string
          author_username: string
          author_avatar_url: string
          prep_time: number
          cook_time: number
          total_time: number
          servings: number
          cuisine_type: string
          difficulty: string
          ingredients: Json
          steps: Json
          allergens: string[]
          tags: string[]
          recipe_interests: string[]
          created_at: string
          cheers_count: number
          saves_count: number
        }[]
      }
      get_shared_post_comments: {
        Args: { shared_post_uuid: string }
        Returns: {
          id: string
          content: string
          created_at: string
          user_id: string
          user_full_name: string
          user_username: string
          user_avatar_url: string
          cheers_count: number
        }[]
      }
      get_shared_post_comments_count: {
        Args: { shared_post_uuid: string }
        Returns: number
      }
      get_user_conversations: {
        Args: { user_uuid: string }
        Returns: {
          conversation_partner_id: string
          conversation_partner_name: string
          conversation_partner_username: string
          conversation_partner_avatar: string
          last_message_text: string
          last_message_time: string
          unread_count: number
          is_sender: boolean
        }[]
      }
      is_following_restaurant: {
        Args: { follower_uuid: string; restaurant_uuid: string }
        Returns: boolean
      }
      is_following_user: {
        Args: { follower_uuid: string; target_user_id: string }
        Returns: boolean
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


export interface SharedPost {
  id: string;
  sharer_id: string;
  shared_type: 'post' | 'recipe' | 'restaurant';
  shared_post_id?: string;
  shared_recipe_id?: string;
  shared_restaurant_id?: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  sharer: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  original_content?: {
    id: string;
    title?: string;
    name?: string;
    content?: string;
    description?: string;
    image_url?: string;
    cover_image_url?: string;
    media_urls?: string[];
    author?: {
      id: string;
      full_name: string;
      username: string;
      avatar_url: string;
    };
    location?: string;
    cuisine_type?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    difficulty?: string;
    created_at?: string;
  };
  cheers_count: number;
  comments_count: number;
  has_cheered: boolean;
}

export interface SharedPostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

export interface SharedPostsResponse {
  sharedPosts: SharedPost[];
  totalCount: number;
  hasMore: boolean;
}

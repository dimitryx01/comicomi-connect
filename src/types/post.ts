
export interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  media_urls?: {
    images?: string[];
    videos?: string[];
  };
  location?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  recipe_id?: string;
  cheers_count: number;
  comments_count: number;
  is_shared?: boolean;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}

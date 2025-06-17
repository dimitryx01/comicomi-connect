
export interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  media_urls: any;
  location: string;
  restaurant_id: string;
  restaurant_name: string;
  cheers_count: number;
  comments_count: number;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}


import { useState } from 'react';

interface Post {
  id: string;
  content: string;
  location?: string;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
}

export const usePostEdit = () => {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const openEditDialog = (post: Post) => {
    console.log('✏️ usePostEdit: Abriendo diálogo de edición para post:', post.id);
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    console.log('✏️ usePostEdit: Cerrando diálogo de edición');
    setEditingPost(null);
    setIsEditDialogOpen(false);
  };

  return {
    editingPost,
    isEditDialogOpen,
    openEditDialog,
    closeEditDialog
  };
};

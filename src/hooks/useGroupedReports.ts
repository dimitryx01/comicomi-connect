import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GroupedReport {
  content_type: string;
  content_id: string;
  report_count: number;
  report_ids: string[];
  report_types: string[];
  reporter_ids: string[];
  first_report_at: string;
  last_report_at: string;
  statuses: string[];
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  has_moderation_action: boolean;
}

export interface ReportDetails {
  id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reporter?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export interface ContentDetails {
  id: string;
  content?: string;
  title?: string;
  name?: string;
  description?: string;
  image_url?: string;
  media_urls?: any[];
  location?: string;
  created_at: string;
  is_public?: boolean;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    email: string;
  };
}

export interface ModerationAction {
  action_type: 'keep' | 'edit' | 'delete' | 'suspend_user_temp' | 'suspend_user_perm';
  action_notes?: string;
  report_ids: string[];
  content_type: string;
  content_id: string;
  author_id?: string;
}

export const useGroupedReports = () => {
  return useQuery({
    queryKey: ['grouped-reports'],
    queryFn: async (): Promise<GroupedReport[]> => {
      const { data, error } = await supabase.rpc('get_grouped_reports');
      
      if (error) {
        console.error('Error fetching grouped reports:', error);
        throw error;
      }
      
      return (data || []).map((item: any) => ({
        ...item,
        priority_level: item.priority_level as 'low' | 'medium' | 'high' | 'critical'
      }));
    },
  });
};

export const useReportDetails = (reportIds: string[]) => {
  return useQuery({
    queryKey: ['report-details', reportIds],
    queryFn: async (): Promise<ReportDetails[]> => {
      if (!reportIds.length) return [];
      
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users!reporter_id(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .in('id', reportIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching report details:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: reportIds.length > 0,
  });
};

export const useContentDetails = (contentType: string, contentId: string) => {
  return useQuery({
    queryKey: ['content-details', contentType, contentId],
    queryFn: async (): Promise<ContentDetails | null> => {
      if (!contentType || !contentId) return null;
      
      const { data, error } = await supabase.rpc('get_reported_content_details', {
        p_content_type: contentType,
        p_content_id: contentId
      });
      
      if (error) {
        console.error('Error fetching content details:', error);
        throw error;
      }
      
      return data as unknown as ContentDetails | null;
    },
    enabled: !!contentType && !!contentId,
  });
};

export const useModerationAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: ModerationAction) => {
      console.log('🔧 Iniciando acción de moderación:', action);
      
      try {
        // Obtener el usuario actual
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Usuario no autenticado');
        }

        // Crear snapshot del contenido antes de la acción
        const { data: contentSnapshot, error: contentError } = await supabase.rpc('get_reported_content_details', {
          p_content_type: action.content_type,
          p_content_id: action.content_id
        });
        
        if (contentError) {
          console.error('Error obteniendo detalles del contenido:', contentError);
          throw new Error('Error al obtener detalles del contenido');
        }

        // Ejecutar la acción según el tipo ANTES de crear el registro de moderación
        if (action.action_type === 'delete') {
          await executeDeleteAction(action.content_type, action.content_id);
        }

        // Crear registro de acción de moderación
        const { data: moderationData, error: moderationError } = await supabase
          .from('moderation_actions')
          .insert({
            report_ids: action.report_ids,
            content_type: action.content_type,
            content_id: action.content_id,
            action_type: action.action_type,
            admin_user_id: user.id,
            action_notes: action.action_notes || null,
            content_snapshot: contentSnapshot || null,
            author_id: action.author_id || null
          })
          .select()
          .single();
        
        if (moderationError) {
          console.error('Error creando acción de moderación:', moderationError);
          throw new Error(`Error al registrar la acción: ${moderationError.message}`);
        }

        // Marcar todos los reportes relacionados como resueltos
        const { error: updateError } = await supabase
          .from('reports')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            admin_notes: `Acción tomada: ${action.action_type}. ${action.action_notes || 'Sin notas adicionales'}`
          })
          .in('id', action.report_ids);
        
        if (updateError) {
          console.error('Error actualizando reportes:', updateError);
          throw new Error(`Error al actualizar reportes: ${updateError.message}`);
        }

        console.log('✅ Acción de moderación completada exitosamente');
        return moderationData;

      } catch (error) {
        console.error('❌ Error en acción de moderación:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grouped-reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-details'] });
      toast.success('Acción de moderación aplicada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error applying moderation action:', error);
      toast.error(error.message || 'Error al aplicar la acción de moderación');
    },
  });
};

const executeDeleteAction = async (contentType: string, contentId: string) => {
  console.log(`🗑️ Ejecutando eliminación de ${contentType} con ID: ${contentId}`);
  
  try {
    switch (contentType) {
      case 'post':
        const { error: postError } = await supabase
          .from('posts')
          .delete()
          .eq('id', contentId);
        if (postError) {
          console.error('Error eliminando post:', postError);
          throw new Error(`Error eliminando publicación: ${postError.message}`);
        }
        console.log('✅ Post eliminado exitosamente');
        break;
        
      case 'recipe':
        const { error: recipeError } = await supabase
          .from('recipes')
          .delete()
          .eq('id', contentId);
        if (recipeError) {
          console.error('Error eliminando receta:', recipeError);
          throw new Error(`Error eliminando receta: ${recipeError.message}`);
        }
        console.log('✅ Receta eliminada exitosamente');
        break;
        
      case 'comment':
        const { error: commentError } = await supabase
          .from('comments')
          .delete()
          .eq('id', contentId);
        if (commentError) {
          console.error('Error eliminando comentario:', commentError);
          throw new Error(`Error eliminando comentario: ${commentError.message}`);
        }
        console.log('✅ Comentario eliminado exitosamente');
        break;
        
      case 'restaurant':
        throw new Error('La eliminación de restaurantes requiere permisos especiales');
        
      default:
        throw new Error(`Tipo de contenido no soportado para eliminación: ${contentType}`);
    }
  } catch (error) {
    console.error(`❌ Error ejecutando eliminación de ${contentType}:`, error);
    throw error;
  }
};
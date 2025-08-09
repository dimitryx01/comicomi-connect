import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { APP_CONFIG } from '@/config/app';

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
  exists?: boolean; // Indica si el contenido existe en la base de datos
}

export interface ModerationHistory {
  id: string;
  action_type: string;
  action_notes?: string;
  created_at: string;
  admin_user_id: string;
  admin_name?: string;
}

export interface ModerationAction {
  action_type: 'keep' | 'edit' | 'delete' | 'suspend_user_temp' | 'suspend_user_perm';
  action_notes?: string;
  report_ids: string[];
  content_type: string;
  content_id: string;
  author_id?: string;
}

// Helper function to parse PostgreSQL arrays
const parsePostgresArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  
  // Handle PostgreSQL array format: {item1,item2,item3} or null
  if (value === 'null' || value === '' || value === '{}') return [];
  
  // Remove curly braces and split by comma
  const cleaned = value.replace(/^{|}$/g, '');
  return cleaned ? cleaned.split(',').map(item => item.trim()) : [];
};

export const useGroupedReports = () => {
  return useQuery({
    queryKey: ['grouped-reports'],
    queryFn: async (): Promise<GroupedReport[]> => {
      const { data, error } = await supabase.rpc('get_grouped_reports');
      
      if (error) {
        console.error('Error fetching grouped reports:', error);
        throw error;
      }
      
      return (data || []).map((item: any) => {
        console.log('🔍 Raw report data:', item); // Debug log
        
        const parsed = {
          ...item,
          report_ids: parsePostgresArray(item.report_ids),
          report_types: parsePostgresArray(item.report_types),
          reporter_ids: parsePostgresArray(item.reporter_ids),
          statuses: parsePostgresArray(item.statuses),
          priority_level: item.priority_level as 'low' | 'medium' | 'high' | 'critical'
        };
        
        console.log('✅ Parsed report data:', parsed); // Debug log
        return parsed;
      });
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
      
      // Primero verificar si el contenido existe directamente en la tabla
      const contentExists = await verifyContentExists(contentType, contentId);
      
      const { data, error } = await supabase.rpc('get_reported_content_details', {
        p_content_type: contentType,
        p_content_id: contentId
      });
      
      if (error) {
        console.error('Error fetching content details:', error);
        throw error;
      }
      
      const contentDetails = data as unknown as ContentDetails | null;
      if (contentDetails) {
        contentDetails.exists = contentExists;
      }
      
      return contentDetails;
    },
    enabled: !!contentType && !!contentId,
  });
};

export const useModerationHistory = (contentType: string, contentId: string) => {
  return useQuery({
    queryKey: ['moderation-history', contentType, contentId],
    queryFn: async (): Promise<ModerationHistory[]> => {
      if (!contentType || !contentId) return [];
      
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          id,
          action_type,
          action_notes,
          created_at,
          admin_user_id,
          admin_users!admin_user_id(
            full_name
          )
        `)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching moderation history:', error);
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        action_type: item.action_type,
        action_notes: item.action_notes,
        created_at: item.created_at,
        admin_user_id: item.admin_user_id,
        admin_name: (item.admin_users as any)?.full_name
      }));
    },
    enabled: !!contentType && !!contentId,
  });
};

export const useResolveReportsOnly = () => {
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();
  
  return useMutation({
    mutationFn: async ({ reportIds, notes }: { reportIds: string[]; notes?: string }) => {
      if (!adminUser) throw new Error('Admin no autenticado');
      
      // Solo marcar reportes como resueltos sin acciones adicionales
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          admin_notes: notes || 'Reportes marcados como resueltos - contenido ya procesado'
        })
        .in('id', reportIds);
      
      if (updateError) {
        throw new Error(`Error al actualizar reportes: ${updateError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grouped-reports'] });
      toast.success('Reportes marcados como resueltos');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al resolver reportes');
    },
  });
};

const verifyContentExists = async (contentType: string, contentId: string): Promise<boolean> => {
  try {
    let result;
    
    switch (contentType) {
      case 'post':
        result = await supabase
          .from('posts')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'recipe':
        result = await supabase
          .from('recipes')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'comment':
        result = await supabase
          .from('comments')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'shared_post':
        result = await supabase
          .from('shared_posts')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'recipe_comment':
        result = await supabase
          .from('recipe_comments')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'shared_post_comment':
        result = await supabase
          .from('shared_post_comments')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      case 'restaurant':
        result = await supabase
          .from('restaurants')
          .select('id')
          .eq('id', contentId)
          .maybeSingle();
        break;
        
      default:
        return false;
    }
    
    return !result.error && !!result.data;
  } catch (error) {
    console.error('Error verificando existencia del contenido:', error);
    return false;
  }
};

export const useModerationAction = () => {
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();
  
  return useMutation({
    mutationFn: async (action: ModerationAction) => {
      console.log('🔧 Iniciando acción de moderación (via edge function):', action);
      if (!adminUser) {
        console.error('❌ Admin no autenticado');
        throw new Error('Admin no autenticado');
      }

      // Map unsupported action types to a safe fallback understood by the function
      const mappedActionType = ['delete', 'keep', 'edit', 'resolve'].includes(action.action_type)
        ? action.action_type
        : 'keep';

      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          admin_user_id: adminUser.id,
          content_type: action.content_type,
          content_id: action.content_id,
          report_ids: action.report_ids,
          action_type: mappedActionType,
          action_notes: action.action_notes || null,
        },
      });

      if (error) {
        console.error('❌ Error invocando función de moderación:', error);
        throw new Error(error.message || 'No se pudo aplicar la acción de moderación');
      }

      console.log('✅ Acción de moderación completada:', data);
      return data;
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
    let deleteResult;
    
    switch (contentType) {
      case 'post':
        deleteResult = await supabase
          .from('posts')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'recipe':
        deleteResult = await supabase
          .from('recipes')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'comment':
        deleteResult = await supabase
          .from('comments')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'shared_post':
        deleteResult = await supabase
          .from('shared_posts')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'recipe_comment':
        deleteResult = await supabase
          .from('recipe_comments')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'shared_post_comment':
        deleteResult = await supabase
          .from('shared_post_comments')
          .delete()
          .eq('id', contentId);
        break;
        
      case 'restaurant':
        throw new Error('La eliminación de restaurantes requiere permisos especiales');
        
      default:
        throw new Error(`Tipo de contenido no soportado para eliminación: ${contentType}`);
    }

    if (deleteResult.error) {
      console.error(`Error RLS eliminando ${contentType}:`, deleteResult.error);
      throw new Error(`No se pudo eliminar el ${contentType}: ${deleteResult.error.message}`);
    }

    // Verificar que se eliminó al menos un registro
    if (deleteResult.count === 0) {
      throw new Error(`No se encontró el ${contentType} con ID ${contentId} o no tienes permisos para eliminarlo`);
    }

    console.log(`✅ ${contentType} eliminado exitosamente:`, contentId);
  } catch (error) {
    console.error(`❌ Error ejecutando eliminación de ${contentType}:`, error);
    throw error;
  }
};
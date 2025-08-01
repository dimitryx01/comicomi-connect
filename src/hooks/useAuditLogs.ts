import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

interface UseAuditLogsParams {
  adminUserId?: string;
  action?: string;
  targetType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export const useAuditLogs = (params: UseAuditLogsParams = {}) => {
  const {
    adminUserId,
    action,
    targetType,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0
  } = params;

  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const { data, error } = await supabase.rpc('get_admin_audit_logs', {
        p_admin_user_id: adminUserId || null,
        p_action: action || null,
        p_target_type: targetType || null,
        p_date_from: dateFrom?.toISOString() || null,
        p_date_to: dateTo?.toISOString() || null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ['auditLogStats'],
    queryFn: async () => {
      // Get statistics for the dashboard
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalActions, todayActions, weekActions, activeAdmins] = await Promise.all([
        // Total actions
        supabase.rpc('get_admin_audit_logs', { p_limit: 1, p_offset: 0 }),
        
        // Today's actions
        supabase.rpc('get_admin_audit_logs', {
          p_date_from: startOfToday.toISOString(),
          p_limit: 1000,
          p_offset: 0
        }),
        
        // Week's actions
        supabase.rpc('get_admin_audit_logs', {
          p_date_from: startOfWeek.toISOString(),
          p_limit: 1000,
          p_offset: 0
        }),
        
        // Active admins (unique admin users who performed actions this week)
        supabase.rpc('get_admin_audit_logs', {
          p_date_from: startOfWeek.toISOString(),
          p_limit: 1000,
          p_offset: 0
        })
      ]);

      const uniqueAdmins = new Set(
        (activeAdmins.data || []).map((log: AuditLogEntry) => log.admin_user_id)
      );

      return {
        totalActions: totalActions.data?.length || 0,
        todayActions: todayActions.data?.length || 0,
        weekActions: weekActions.data?.length || 0,
        activeAdmins: uniqueAdmins.size
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
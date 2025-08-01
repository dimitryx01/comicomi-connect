import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Building, 
  HeadphonesIcon,
  Shield,
  BarChart3,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const { adminUser, hasRole } = useAdminAuth();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin_master':
        return 'default';
      case 'moderador_contenido':
        return 'secondary';
      case 'gestor_establecimientos':
        return 'outline';
      case 'soporte_tecnico':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin_master':
        return 'Admin Master';
      case 'moderador_contenido':
        return 'Moderador de Contenido';
      case 'gestor_establecimientos':
        return 'Gestor de Establecimientos';
      case 'soporte_tecnico':
        return 'Soporte Técnico';
      default:
        return role;
    }
  };

  // Fetch real statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [reportsRes, restaurantsRes, usersRes] = await Promise.all([
        supabase.from('reports').select('id, status').eq('status', 'pending'),
        supabase.from('restaurants').select('id, is_verified'),
        supabase.from('users').select('id, created_at')
      ]);

      return {
        activeReports: reportsRes.data?.length || 0,
        totalRestaurants: restaurantsRes.data?.length || 0,
        verifiedRestaurants: restaurantsRes.data?.filter(r => r.is_verified).length || 0,
        newUsersToday: usersRes.data?.filter(u => 
          new Date(u.created_at).toDateString() === new Date().toDateString()
        ).length || 0,
      };
    },
  });

  const stats = [
    {
      title: 'Reportes Activos',
      value: dashboardStats?.activeReports?.toString() || '0',
      description: 'Pendientes de revisión',
      icon: AlertTriangle,
      color: 'text-orange-600',
      show: hasRole('moderador_contenido'),
    },
    {
      title: 'Nuevos Usuarios',
      value: dashboardStats?.newUsersToday?.toString() || '0',
      description: 'Registrados hoy',
      icon: Users,
      color: 'text-green-600',
      show: hasRole('moderador_contenido') || hasRole('soporte_tecnico'),
    },
    {
      title: 'Establecimientos',
      value: dashboardStats?.totalRestaurants?.toString() || '0',
      description: 'Registrados en la plataforma',
      icon: Building,
      color: 'text-blue-600',
      show: hasRole('gestor_establecimientos'),
    },
    {
      title: 'Verificados',
      value: dashboardStats?.verifiedRestaurants?.toString() || '0',
      description: 'Restaurantes verificados',
      icon: CheckCircle,
      color: 'text-green-600',
      show: hasRole('gestor_establecimientos'),
    },
  ];

  const modules = [
    {
      title: 'Reportes de Contenido',
      description: 'Gestionar reportes de usuarios sobre contenido inapropiado',
      icon: MessageSquare,
      color: 'text-orange-600',
      show: hasRole('moderador_contenido'),
      path: '/control-admin/reportes',
    },
    {
      title: 'Gestión de Establecimientos',
      description: 'Administrar restaurantes y solicitudes de nuevos establecimientos',
      icon: Building,
      color: 'text-blue-600',
      show: hasRole('gestor_establecimientos'),
      path: '/control-admin/establecimientos',
    },
    {
      title: 'Soporte Técnico',
      description: 'Gestionar cuentas de usuario y resolver problemas técnicos',
      icon: HeadphonesIcon,
      color: 'text-green-600',
      show: hasRole('soporte_tecnico'),
      path: '/control-admin/soporte',
    },
    {
      title: 'Usuarios Administrativos',
      description: 'Gestionar cuentas y roles del personal administrativo',
      icon: Shield,
      color: 'text-purple-600',
      show: hasRole('admin_master'),
      path: '/control-admin/admin-users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido, {adminUser?.full_name}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {adminUser?.roles.map((role) => (
            <Badge 
              key={role} 
              variant={getRoleBadgeVariant(role)}
            >
              {getRoleDisplayName(role)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(stat => stat.show).map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Módulos disponibles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Módulos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.filter(module => module.show).map((module) => (
            <Card key={module.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{module.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <RecentActivity />
    </div>
  );
};

export default AdminDashboard;
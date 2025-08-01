import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes y Moderación</h1>
        <p className="text-muted-foreground">
          Gestiona reportes de contenido y modera publicaciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
          <CardDescription>
            El módulo de reportes y moderación estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidades pendientes:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Lista de reportes por tipo (posts, comentarios, usuarios, etc.)</li>
            <li>Filtros y ordenamiento por prioridad</li>
            <li>Acciones de moderación (aprobar/eliminar/bloquear)</li>
            <li>Historial de moderación</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
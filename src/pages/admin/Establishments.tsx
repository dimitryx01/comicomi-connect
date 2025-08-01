import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Establishments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Establecimientos</h1>
        <p className="text-muted-foreground">
          Administra restaurantes y solicitudes de registro
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
          <CardDescription>
            El módulo de gestión de establecimientos estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidades pendientes:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
            <li>CRUD completo de restaurantes</li>
            <li>Gestión de solicitudes de usuarios</li>
            <li>Moderación de contenido de restaurantes</li>
            <li>Verificación de establecimientos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Establishments;
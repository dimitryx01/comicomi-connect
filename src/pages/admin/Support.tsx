import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Support: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Soporte Técnico</h1>
        <p className="text-muted-foreground">
          Herramientas de soporte y gestión de usuarios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
          <CardDescription>
            El módulo de soporte técnico estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidades pendientes:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Buscador de usuarios por email/nombre/ID</li>
            <li>Panel para resetear contraseñas</li>
            <li>Historial de actividad de usuarios</li>
            <li>Herramientas de diagnóstico</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const requestAccessSchema = z.object({
  full_name: z.string().min(2, 'El nombre completo es obligatorio'),
  legal_name: z.string().min(2, 'La razón social es obligatoria'),
  tax_id: z.string().min(8, 'El NIF/CIF/NIE es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'El teléfono es obligatorio'),
});

type RequestAccessForm = z.infer<typeof requestAccessSchema>;

interface RequestAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
  existingRequest?: any;
}

export const RequestAccessDialog: React.FC<RequestAccessDialogProps> = ({
  open,
  onOpenChange,
  restaurantId,
  restaurantName,
  existingRequest,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      full_name: '',
      legal_name: '',
      tax_id: '',
      email: user?.email || '',
      phone: '',
    },
  });

  // Siempre resetear para nueva solicitud
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: '',
        legal_name: '',
        tax_id: '',
        email: user?.email || '',
        phone: '',
      });
    }
  }, [open, user?.email, form]);

  const onSubmit = async (data: RequestAccessForm) => {
    if (!user) {
      toast.error('Debes estar autenticado para enviar una solicitud');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user can make a new request
      const { data: canRequest, error: checkError } = await supabase.rpc(
        'can_user_request_restaurant_access',
        {
          p_user_id: user.id,
          p_restaurant_id: restaurantId
        }
      );

      if (checkError) {
        console.error('Error checking request eligibility:', checkError);
        toast.error('Error verificando elegibilidad para solicitud');
        return;
      }

      if (!canRequest) {
        toast.error(
          'No puedes hacer más solicitudes para este restaurante. Contacta soporte si necesitas ayuda.'
        );
        return;
      }

      // Siempre crear nueva solicitud
      const { error } = await supabase
        .from('restaurant_admin_requests')
        .insert({
          restaurant_id: restaurantId,
          requester_user_id: user.id,
          full_name: data.full_name,
          legal_name: data.legal_name,
          tax_id: data.tax_id,
          email: data.email,
          phone: data.phone,
        });

      if (error) throw error;

      toast.success(
        'Su solicitud ha sido enviada. Recibirá una respuesta en un plazo hábil de 7 días por correo electrónico.'
      );

      onOpenChange(false);
      // Refresh the page to update the request status
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      if (error.code === '23505') {
        toast.error('Ya tiene una solicitud pendiente para este restaurante');
      } else {
        toast.error('Error al enviar la solicitud. Inténtelo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Siempre crear nueva solicitud - no editar
  const isEditing = false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Solicitar acceso a restaurante
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para solicitar acceso de administración a "{restaurantName}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Introduce tu nombre completo"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social o nombre legal *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre legal de la empresa"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF/CIF/NIE *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Número de identificación fiscal"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Número de teléfono"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
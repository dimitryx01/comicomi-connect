import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { APP_CONFIG } from '@/config/app';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  type: z.enum(['general', 'support', 'investor', 'partnership'])
});

type FormData = z.infer<typeof formSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      type: 'general'
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos pronto."
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contacta con nosotros
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes una pregunta, sugerencia o quieres formar parte de nuestro crecimiento? 
            Estamos aquí para escucharte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de consulta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de consulta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">Consulta general</SelectItem>
                            <SelectItem value="support">Soporte técnico</SelectItem>
                            <SelectItem value="investor">Oportunidades de inversión</SelectItem>
                            <SelectItem value="partnership">Colaboraciones</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Tema de tu mensaje" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos cómo podemos ayudarte..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
                <CardDescription>
                  Otras formas de ponerte en contacto con nosotros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email general</p>
                    <p className="text-muted-foreground">{APP_CONFIG.contactEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Soporte técnico</p>
                    <p className="text-muted-foreground">{APP_CONFIG.supportEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-muted-foreground">{APP_CONFIG.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-muted-foreground">{APP_CONFIG.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horario de atención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="text-muted-foreground">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados</span>
                    <span className="text-muted-foreground">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos</span>
                    <span className="text-muted-foreground">Cerrado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Investor Section */}
        <div className="bg-gradient-to-br from-primary/10 via-orange-50/50 to-red-50/30 dark:from-primary/5 dark:via-orange-950/20 dark:to-red-950/10 rounded-3xl p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              Oportunidad de inversión
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              ¿Te interesa este proyecto?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Buscamos el complemento ideal para crecer juntos. Únete a la revolución gastronómica 
              y forma parte del futuro de la conexión culinaria.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground">10K+</span>
                </div>
                <p className="text-muted-foreground">Usuarios registrados</p>
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground">95%</span>
                </div>
                <p className="text-muted-foreground">Satisfacción usuario</p>
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground">300%</span>
                </div>
                <p className="text-muted-foreground">Crecimiento anual</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                onClick={() => window.location.href = `mailto:${APP_CONFIG.investorEmail}?subject=Interés en inversión&body=Hola, estoy interesado/a en conocer más sobre las oportunidades de inversión en ${APP_CONFIG.nameCapitalized}.`}
              >
                Contactar como inversor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => form.setValue('type', 'investor')}
              >
                Más información
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Contáctanos en{' '}
              <a 
                href={`mailto:${APP_CONFIG.investorEmail}`}
                className="text-primary hover:underline font-medium"
              >
                {APP_CONFIG.investorEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
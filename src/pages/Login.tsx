
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🔑 Login: Attempting login for email:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login: Login error:', error);
        
        // Manejo específico de errores
        if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "Email no confirmado",
            description: "Por favor revisa tu email y confirma tu cuenta antes de iniciar sesión."
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Credenciales incorrectas",
            description: "Email o contraseña incorrectos. Por favor inténtalo de nuevo."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error al iniciar sesión",
            description: error.message || "Por favor inténtalo de nuevo."
          });
        }
        return;
      }

      if (data.user) {
        console.log('✅ Login: User logged in successfully:', data.user.id);
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente."
        });
        
        // La redirección será manejada por RedirectIfAuthenticated
        console.log('➡️ Login: Redirection will be handled by RedirectIfAuthenticated component');
      }
    } catch (error: any) {
      console.error('💥 Login: Unexpected login error:', error);
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ha ocurrido un error. Por favor inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingresa tu email para reenviar la confirmación."
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } else {
        toast({
          title: "Email reenviado",
          description: "Hemos reenviado el email de confirmación. Por favor revisa tu bandeja de entrada."
        });
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reenviar el email de confirmación."
      });
    }
  };

  return (
    <PageLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>
              
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  className="w-full"
                  disabled={!email || isLoading}
                >
                  Reenviar email de confirmación
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿No tienes cuenta? </span>
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Registrarse
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from '@/components/layout/PageLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll just simulate a login
      if (email === 'user@example.com' && password === 'password') {
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        
        // In a real app, this would store JWT tokens, etc.
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'user');
        
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (email === 'moderator@example.com' && password === 'password') {
        toast({
          title: "Success!",
          description: "You have been logged in as a moderator.",
        });
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'moderator');
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (email === 'admin@example.com' && password === 'password') {
        toast({
          title: "Success!",
          description: "You have been logged in as an administrator.",
        });
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: "Invalid email or password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to log in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to sign in to your account
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                  <div className="text-sm text-right">
                    <Link to="/forgot-password" className="text-muted-foreground hover:text-primary">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-muted-foreground">
                  Demo Accounts:
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="border rounded-md p-2">
                    <div className="font-medium">User</div>
                    <div className="text-muted-foreground">user@example.com</div>
                    <div className="text-muted-foreground">password</div>
                  </div>
                  <div className="border rounded-md p-2">
                    <div className="font-medium">Moderator</div>
                    <div className="text-muted-foreground">moderator@example.com</div>
                    <div className="text-muted-foreground">password</div>
                  </div>
                  <div className="border rounded-md p-2">
                    <div className="font-medium">Admin</div>
                    <div className="text-muted-foreground">admin@example.com</div>
                    <div className="text-muted-foreground">password</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
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

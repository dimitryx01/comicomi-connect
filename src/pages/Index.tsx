import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChefHat, Users, MapPin, Heart, Star, Search, MessageSquare, Utensils, Facebook, Instagram, Camera } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  console.log('[DEBUG] Index: Auth state', { isAuthenticated, loading });

  // Redirect authenticated users to feed
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('[DEBUG] Index: Redirecting authenticated user to feed');
      navigate('/feed', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading screen for authenticated users while redirect happens
  if (isAuthenticated) {
    console.log('[DEBUG] Index: User is authenticated, showing loading while redirect happens');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        
        {/* Orange Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-orange-200/40"></div>
        
        <div className="relative z-10 w-full py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Logo y Brand */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  {APP_CONFIG.name}
                </h1>
              </div>
              
              {/* Headline principal */}
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                Tu comunidad gastronómica,<br />
                <span className="bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">
                  en un solo lugar
                </span>
              </h2>
              
              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
                Descubre, comparte y saborea el mundo con {APP_CONFIG.nameCapitalized}. 
                La red social donde los amantes de la gastronomía se encuentran.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/discover')} 
                  className="text-xl px-12 py-6 h-auto bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 transform hover:scale-105 transition-all duration-200 shadow-xl"
                >
                  <Search className="mr-3 h-6 w-6" />
                  Explorar Ahora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/register')} 
                  className="text-xl px-12 py-6 h-auto border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
                >
                  Únete Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vivir la gastronomía
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa para descubrir, crear y compartir experiencias culinarias únicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Recetas Increíbles</h4>
                <p className="text-gray-600 leading-relaxed">
                  Descubre miles de recetas únicas y comparte tus creaciones culinarias con la comunidad
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Restaurantes</h4>
                <p className="text-gray-600 leading-relaxed">
                  Explora los mejores restaurantes, lee reseñas auténticas y encuentra tu próximo lugar favorito
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Comunidad</h4>
                <p className="text-gray-600 leading-relaxed">
                  Conecta con otros foodies, sigue a tus chefs favoritos y forma parte de una comunidad apasionada
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Favoritos</h4>
                <p className="text-gray-600 leading-relaxed">
                  Guarda tus recetas y restaurantes favoritos para acceder a ellos cuando quieras
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="py-20 bg-gradient-to-r from-primary/5 to-orange-100/30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                Una experiencia gastronómica completa
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Descubre nuevos sabores</h4>
                    <p className="text-gray-600">Explora una amplia variedad de recetas y restaurantes de todo el mundo</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Comparte tus creaciones</h4>
                    <p className="text-gray-600">Publica tus recetas favoritas y experiencias gastronómicas únicas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Conecta con la comunidad</h4>
                    <p className="text-gray-600">Chatea, comenta y forma relaciones con otros amantes de la gastronomía</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-orange-200/40 rounded-3xl overflow-hidden">
                <Carousel 
                  className="w-full h-full"
                  plugins={[
                    Autoplay({
                      delay: 1500,
                    }),
                  ]}
                >
                  <CarouselContent className="h-full -ml-0">
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=500&fit=crop" 
                          alt="Food photography"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Photo by @foodie_explorer</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=500&fit=crop" 
                          alt="Cooking workspace"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Photo by @chef_moments</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop" 
                          alt="Kitchen equipment"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Photo by @kitchen_tech</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=500&fit=crop" 
                          alt="Food preparation"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Photo by @culinary_art</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=500&fit=crop" 
                          alt="Dining experience"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Photo by @dining_vibes</span>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dice nuestra comunidad
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-orange-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "{APP_CONFIG.nameCapitalized} ha revolucionado mi forma de cocinar. He descubierto recetas increíbles y he conectado con chefs de todo el mundo. ¡Es adictivo!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">María González</p>
                    <p className="text-gray-600 text-sm">Chef aficionada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "Gracias a {APP_CONFIG.nameCapitalized} he encontrado los mejores restaurantes de mi ciudad y he hecho amigos que comparten mi pasión por la comida. ¡Imprescindible!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Alejandro Ruiz</p>
                    <p className="text-gray-600 text-sm">Food blogger</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-orange-500 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar tu aventura gastronómica?
          </h3>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Únete a miles de foodies que ya están descubriendo, compartiendo y conectando en {APP_CONFIG.nameCapitalized}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/discover')} 
              className="text-xl px-12 py-6 h-auto bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <Search className="mr-3 h-6 w-6" />
              Explorar {APP_CONFIG.nameCapitalized}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/register')} 
              className="text-xl px-12 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-primary transform hover:scale-105 transition-all duration-200"
            >
              Crear Cuenta Gratis
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;

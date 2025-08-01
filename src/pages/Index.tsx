import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Users, MapPin, Heart, Star, Search, MessageSquare, Utensils, Facebook, Instagram } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // No automatic redirects here - let AuthContext handle all auth redirections
  // This prevents conflicts and infinite redirect loops

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to feed
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-orange-200/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            {/* Logo y Brand */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
                comicomi
              </h1>
            </div>
            
            {/* Headline principal */}
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Tu comunidad gastronómica,<br />
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h2>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre, comparte y saborea el mundo con Comicomi. 
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
                className="text-xl px-12 py-6 h-auto border-2 border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-200"
              >
                Únete Gratis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
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
      <div className="py-20 bg-gradient-to-r from-primary/5 to-orange-100/30 -mx-4 sm:-mx-6 lg:-mx-8">
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
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-orange-200/40 rounded-3xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto">
                    <ChefHat className="h-16 w-16 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">¡Únete a miles de foodies!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
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
                  "Comicomi ha revolucionado mi forma de cocinar. He descubierto recetas increíbles y he conectado con chefs de todo el mundo. ¡Es adictivo!"
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
                  "Gracias a Comicomi he encontrado los mejores restaurantes de mi ciudad y he hecho amigos que comparten mi pasión por la comida. ¡Imprescindible!"
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
      <div className="py-20 bg-gradient-to-r from-primary to-orange-500 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar tu aventura gastronómica?
          </h3>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Únete a miles de foodies que ya están descubriendo, compartiendo y conectando en Comicomi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/discover')} 
              className="text-xl px-12 py-6 h-auto bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <Search className="mr-3 h-6 w-6" />
              Explorar Comicomi
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

      {/* Footer */}
      <footer className="bg-gray-900 py-16 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white">comicomi</h4>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed mb-6">
                La red social gastronómica donde los amantes de la comida se encuentran para descubrir, compartir y conectar.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-2.54v5.79c0 2.84-2.26 5.14-5.09 5.14-1.09 0-2.09-.41-2.84-1.08.24 3.15 2.99 5.6 6.3 5.6 3.83 0 7.01-3.14 7.01-7.01 0-.19-.01-.38-.03-.56a7.03 7.03 0 0 0 1.62-1.75c-.59.26-1.25.43-1.93.51.7-.42 1.23-1.08 1.48-1.86-.65.38-1.37.66-2.14.81z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Explora</h5>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white transition-colors">Descubrir</button></li>
                <li><button onClick={() => navigate('/recipes')} className="text-gray-400 hover:text-white transition-colors">Recetas</button></li>
                <li><button onClick={() => navigate('/restaurants')} className="text-gray-400 hover:text-white transition-colors">Restaurantes</button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Únete</h5>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/register')} className="text-gray-400 hover:text-white transition-colors">Crear cuenta</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition-colors">Iniciar sesión</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Comicomi. Hecho con ❤️ para los amantes de la gastronomía.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useNavigate } from 'react-router-dom';
import { ChefHat, Facebook, Instagram } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 py-16 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white">{APP_CONFIG.name}</h4>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              La red social gastronómica donde los amantes de la comida se encuentran para descubrir, compartir y conectar.
            </p>
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
          
          <div>
            <h5 className="text-white font-semibold mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate(APP_CONFIG.privacyPolicyUrl)} className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</button></li>
              <li><button onClick={() => navigate(APP_CONFIG.termsUrl)} className="text-gray-400 hover:text-white transition-colors">Términos y Condiciones</button></li>
              <li><button onClick={() => navigate(APP_CONFIG.cookiesPolicyUrl)} className="text-gray-400 hover:text-white transition-colors">Política de Cookies</button></li>
              <li><button onClick={() => navigate(APP_CONFIG.legalNoticeUrl)} className="text-gray-400 hover:text-white transition-colors">Aviso Legal</button></li>
              <li><button onClick={() => navigate(APP_CONFIG.contactUrl)} className="text-gray-400 hover:text-white transition-colors">Contacto</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              © 2024 {APP_CONFIG.nameCapitalized}. Hecho con ❤️ para los amantes de la gastronomía.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-2.54v5.79c0 2.84-2.26 5.14-5.09 5.14-1.09 0-2.09-.41-2.84-1.08.24 3.15 2.99 5.6 6.3 5.6 3.83 0 7.01-3.14 7.01-7.01 0-.19-.01-.38-.03-.56a7.03 7.03 0 0 0 1.62-1.75c-.59.26-1.25.43-1.93.51.7-.42 1.23-1.08 1.48-1.86-.65.38-1.37.66-2.14.81z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
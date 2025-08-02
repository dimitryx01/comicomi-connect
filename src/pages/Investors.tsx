import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Store, 
  Heart, 
  DollarSign,
  Target,
  Zap,
  Globe,
  ChefHat,
  Star,
  PlayCircle,
  Download,
  Calendar,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

const Investors = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const metricPosts = [
    {
      type: 'crecimiento',
      icon: <TrendingUp className="w-6 h-6" />,
      title: '¡+47% usuarios activos este mes! 💹',
      subtitle: 'Crecimiento exponencial sostenido',
      value: '850K usuarios',
      color: 'from-green-500 to-emerald-600'
    },
    {
      type: 'restaurante',
      icon: <Store className="w-6 h-6" />,
      title: 'Restaurant Casa María aumentó ventas 300% 🔥',
      subtitle: 'Casos de éxito reales',
      value: '+€45K facturación',
      color: 'from-orange-500 to-red-600'
    },
    {
      type: 'engagement',
      icon: <Heart className="w-6 h-6" />,
      title: '12M interacciones gastronómicas este trimestre ❤️',
      subtitle: 'Comunidad ultra-activa',
      value: '95% retención',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const businessMetrics = [
    {
      title: 'Revenue Streams',
      items: [
        { name: 'Comisiones Marketplace', value: '€2.8M', growth: '+85%' },
        { name: 'Publicidad Restaurantes', value: '€1.2M', growth: '+156%' },
        { name: 'Subscripciones Premium', value: '€890K', growth: '+203%' }
      ]
    },
    {
      title: 'Métricas de Crecimiento',
      items: [
        { name: 'Usuarios Activos Mensuales', value: '850K', growth: '+47%' },
        { name: 'Restaurantes Partner', value: '12.5K', growth: '+89%' },
        { name: 'Transacciones Mensuales', value: '450K', growth: '+112%' }
      ]
    }
  ];

  const testimonials = [
    {
      type: 'restaurante',
      name: 'Carlos Mendoza',
      role: 'Propietario, Restaurante El Rincón',
      quote: 'Antes tenía 30 mesas por noche, ahora gestiono 200 pedidos diarios gracias a comicomi',
      impact: '+340% ingresos',
      avatar: '👨‍🍳'
    },
    {
      type: 'chef',
      name: 'Ana García',
      role: 'Chef Ejecutiva',
      quote: 'Mis recetas llegaron a 50K personas y ahora tengo mi propio programa de cocina',
      impact: '50K seguidores',
      avatar: '👩‍🍳'
    },
    {
      type: 'usuario',
      name: 'María López',
      role: 'Food Lover',
      quote: 'Encontré 25 restaurantes increíbles cerca de casa que nunca habría descubierto',
      impact: 'Nueva experiencia gastronómica',
      avatar: '🍴'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metricPosts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section - Feed Simulado */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-primary to-destructive text-white px-4 py-2">
                  Oportunidad de Inversión Exclusiva
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent leading-tight">
                  El Ecosistema Gastronómico del Futuro
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Únete a la revolución digital que está transformando cómo España come, 
                  descubre y conecta con la gastronomía. Una oportunidad de inversión única 
                  en el mercado de €47B.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-destructive hover:from-primary/90 hover:to-destructive/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => scrollToSection('contact')}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Invertir en el Futuro Gastronómico
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Ver Pitch Deck Exclusivo
                </Button>
              </div>
            </motion.div>

            {/* Right Content - Feed Simulado */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card border rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-destructive rounded-full flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Comicomi Analytics</h3>
                    <p className="text-sm text-muted-foreground">Métricas en tiempo real</p>
                  </div>
                </div>

                <motion.div
                  key={currentMetric}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-r ${metricPosts[currentMetric].color} rounded-xl p-6 text-white`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {metricPosts[currentMetric].icon}
                        <span className="text-2xl font-bold">{metricPosts[currentMetric].value}</span>
                      </div>
                      <h4 className="text-lg font-semibold">{metricPosts[currentMetric].title}</h4>
                      <p className="text-white/80 text-sm">{metricPosts[currentMetric].subtitle}</p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center space-x-2">
                  {metricPosts.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentMetric ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Métricas de Negocio */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">La Cocina de los Números</h2>
            <p className="text-xl text-muted-foreground">
              Ingredientes de éxito que crean el plato perfecto para inversionistas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {businessMetrics.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <PieChart className="w-6 h-6 text-primary" />
                      {section.title}
                    </h3>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-2xl font-bold text-primary">{item.value}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {item.growth}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mapa del Hambre Digital */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">El Mapa del Hambre Digital</h2>
            <p className="text-xl text-muted-foreground">
              Visualización del ecosistema gastronómico español en tiempo real
            </p>
          </motion.div>

          <Card className="border-2">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">850K+</p>
                    <p className="text-muted-foreground">Usuarios Activos</p>
                    <p className="text-sm text-green-600 font-medium">+47% crecimiento mensual</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">12.5K+</p>
                    <p className="text-muted-foreground">Restaurantes Partner</p>
                    <p className="text-sm text-green-600 font-medium">+89% crecimiento anual</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">€4.9M</p>
                    <p className="text-muted-foreground">Revenue Anual</p>
                    <p className="text-sm text-green-600 font-medium">+127% crecimiento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimoniales 360° */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Testimoniales 360°</h2>
            <p className="text-xl text-muted-foreground">
              Historias reales de transformación gastronómica
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full border-2 hover:border-primary/20 transition-all hover:shadow-lg">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">{testimonial.avatar}</div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                    
                    <blockquote className="text-center italic mb-4 text-muted-foreground">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <div className="text-center">
                      <Badge className="bg-gradient-to-r from-primary to-destructive text-white">
                        {testimonial.impact}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Los 3 Motores de Crecimiento */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Los 3 Motores de Crecimiento</h2>
            <p className="text-xl text-muted-foreground">
              Múltiples fuentes de ingresos en un ecosistema escalable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Marketplace Gastronómico',
                description: 'Comisiones por reservas, pedidos y transacciones',
                revenue: '€2.8M anuales',
                growth: '+85%',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Publicidad Premium',
                description: 'Sistema de ads para restaurantes y marcas',
                revenue: '€1.2M anuales',
                growth: '+156%',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: 'Subscripciones Pro',
                description: 'Funcionalidades avanzadas para usuarios',
                revenue: '€890K anuales',
                growth: '+203%',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((motor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full border-2 hover:border-primary/20 transition-all hover:shadow-lg group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${motor.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{motor.icon}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{motor.title}</h3>
                    <p className="text-muted-foreground mb-6">{motor.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-primary">{motor.revenue}</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {motor.growth} crecimiento
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-r from-primary via-destructive to-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              ¿Listo para ser parte de la Revolución Gastronómica?
            </h2>
            <p className="text-xl opacity-90">
              Únete a los inversionistas visionarios que están transformando 
              el futuro de la gastronomía en España.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Demo Privada
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Ver Video Pitch
              </Button>
            </div>

            <div className="pt-8 border-t border-white/20">
              <p className="text-lg opacity-90">
                Contacto directo para inversionistas: {APP_CONFIG.investorEmail}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Investors;
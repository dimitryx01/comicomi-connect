import { APP_CONFIG } from '@/config/app';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';

const CookiesPolicy = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Política de Cookies
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
              visita nuestro sitio web. Nos ayudan a mejorar su experiencia y analizar el uso de 
              la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Cookies que Utilizamos</h2>
            
            <h3 className="text-xl font-semibold mb-3">Cookies Estrictamente Necesarias</h3>
            <p>Estas cookies son esenciales para el funcionamiento de la plataforma:</p>
            <ul>
              <li><strong>Sesión de usuario:</strong> Mantienen su sesión activa</li>
              <li><strong>Seguridad:</strong> Protegen contra ataques y fraudes</li>
              <li><strong>Preferencias:</strong> Recuerdan sus configuraciones</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cookies de Rendimiento</h3>
            <p>Nos ayudan a entender cómo interactúa con nuestra plataforma:</p>
            <ul>
              <li><strong>Analítica:</strong> Recopilan información sobre el uso del sitio</li>
              <li><strong>Optimización:</strong> Mejoran el rendimiento y la velocidad</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cookies de Funcionalidad</h3>
            <p>Mejoran su experiencia de usuario:</p>
            <ul>
              <li><strong>Personalización:</strong> Recuerdan sus preferencias</li>
              <li><strong>Idioma:</strong> Mantienen su elección de idioma</li>
              <li><strong>Tema:</strong> Guardan sus preferencias visuales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cookies de Terceros</h2>
            <p>
              Utilizamos servicios de terceros que pueden establecer sus propias cookies:
            </p>
            <ul>
              <li><strong>Servicios de autenticación:</strong> Para facilitar el login</li>
              <li><strong>Análisis:</strong> Para entender el comportamiento de los usuarios</li>
              <li><strong>Redes sociales:</strong> Para compartir contenido</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Gestión de Cookies</h2>
            <p>
              Puede gestionar las cookies de varias maneras:
            </p>
            
            <h3 className="text-xl font-semibold mb-3">A través de su Navegador</h3>
            <p>La mayoría de navegadores permiten:</p>
            <ul>
              <li>Ver qué cookies están almacenadas</li>
              <li>Eliminar cookies existentes</li>
              <li>Bloquear cookies de sitios específicos</li>
              <li>Configurar notificaciones antes de aceptar cookies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Enlaces de Ayuda por Navegador</h3>
            <ul>
              <li><strong>Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies</li>
              <li><strong>Firefox:</strong> Opciones &gt; Privacidad y seguridad</li>
              <li><strong>Safari:</strong> Preferencias &gt; Privacidad</li>
              <li><strong>Edge:</strong> Configuración &gt; Privacidad, búsqueda y servicios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Consecuencias de Deshabilitar Cookies</h2>
            <p>
              Si deshabilita las cookies, algunas funcionalidades pueden verse afectadas:
            </p>
            <ul>
              <li>Dificultades para mantener la sesión iniciada</li>
              <li>Pérdida de preferencias personalizadas</li>
              <li>Reducción en la funcionalidad de algunas características</li>
              <li>Experiencia de usuario menos optimizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Actualizaciones de esta Política</h2>
            <p>
              Esta política puede ser actualizada periódicamente. Le notificaremos sobre 
              cambios significativos a través de nuestra plataforma o por email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Consentimiento</h2>
            <p>
              Al continuar utilizando {APP_CONFIG.nameCapitalized}, acepta el uso de cookies 
              según se describe en esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
            <p>
              Para consultas sobre cookies, contacte con nosotros:
            </p>
            <p>
              Email: {APP_CONFIG.contactEmail}<br />
              Teléfono: {APP_CONFIG.phone}<br />
              Dirección: {APP_CONFIG.address}
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Enlaces relacionados</h3>
          <div className="flex flex-wrap gap-4">
            <Link to={APP_CONFIG.privacyPolicyUrl} className="text-primary hover:underline">
              Política de Privacidad
            </Link>
            <Link to={APP_CONFIG.termsUrl} className="text-primary hover:underline">
              Términos y Condiciones
            </Link>
            <Link to={APP_CONFIG.legalNoticeUrl} className="text-primary hover:underline">
              Aviso Legal
            </Link>
            <Link to={APP_CONFIG.contactUrl} className="text-primary hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CookiesPolicy;
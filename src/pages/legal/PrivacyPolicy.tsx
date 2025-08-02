import { APP_CONFIG } from '@/config/app';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Responsable del Tratamiento</h2>
            <p>
              {APP_CONFIG.companyName}, con NIF {APP_CONFIG.nif}, domiciliada en {APP_CONFIG.address}, 
              es la responsable del tratamiento de sus datos personales.
            </p>
            <p>
              <strong>Datos de contacto:</strong><br />
              Email: {APP_CONFIG.contactEmail}<br />
              Teléfono: {APP_CONFIG.phone}<br />
              Dirección: {APP_CONFIG.address}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Finalidades del Tratamiento</h2>
            <p>Tratamos sus datos personales para las siguientes finalidades:</p>
            <ul>
              <li>Gestión de la cuenta de usuario y acceso a la plataforma</li>
              <li>Prestación de los servicios de la red social gastronómica</li>
              <li>Comunicación con el usuario</li>
              <li>Mejora de nuestros servicios</li>
              <li>Cumplimiento de obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Base Jurídica</h2>
            <p>
              El tratamiento de sus datos se basa en el consentimiento que nos otorga al registrarse 
              en nuestra plataforma y en la ejecución del contrato de prestación de servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Datos que Recopilamos</h2>
            <ul>
              <li>Datos de identificación: nombre, apellidos, email</li>
              <li>Datos de perfil: biografía, foto, preferencias gastronómicas</li>
              <li>Contenido generado: publicaciones, comentarios, valoraciones</li>
              <li>Datos de navegación: cookies, dirección IP, dispositivo utilizado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
              <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Limitación:</strong> Restringir el tratamiento</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento</li>
            </ul>
            <p>
              Para ejercer estos derechos, contacte con nosotros en {APP_CONFIG.contactEmail}.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Conservación de Datos</h2>
            <p>
              Conservaremos sus datos mientras mantenga activa su cuenta. Una vez eliminada, 
              conservaremos únicamente los datos necesarios para cumplir con nuestras obligaciones legales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Transferencias Internacionales</h2>
            <p>
              Sus datos pueden ser transferidos a proveedores de servicios ubicados fuera del Espacio 
              Económico Europeo, siempre con las garantías adecuadas de protección.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta política, puede contactarnos en {APP_CONFIG.contactEmail} 
              o en la dirección {APP_CONFIG.address}.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Enlaces relacionados</h3>
          <div className="flex flex-wrap gap-4">
            <Link to={APP_CONFIG.termsUrl} className="text-primary hover:underline">
              Términos y Condiciones
            </Link>
            <Link to={APP_CONFIG.cookiesPolicyUrl} className="text-primary hover:underline">
              Política de Cookies
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

export default PrivacyPolicy;
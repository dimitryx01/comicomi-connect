import { APP_CONFIG } from '@/config/app';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Información General</h2>
            <p>
              Estos términos y condiciones regulan el uso de la plataforma {APP_CONFIG.nameCapitalized}, 
              operada por {APP_CONFIG.companyName}, con domicilio en {APP_CONFIG.address}.
            </p>
            <p>
              Al utilizar nuestros servicios, usted acepta estos términos en su totalidad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p>
              {APP_CONFIG.nameCapitalized} es una red social gastronómica que permite a los usuarios:
            </p>
            <ul>
              <li>Crear perfiles y compartir contenido gastronómico</li>
              <li>Descubrir recetas y restaurantes</li>
              <li>Interactuar con otros usuarios de la comunidad</li>
              <li>Guardar y organizar contenido favorito</li>
              <li>Participar en conversaciones y valoraciones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Registro y Cuenta de Usuario</h2>
            <p>Para utilizar nuestros servicios, debe:</p>
            <ul>
              <li>Ser mayor de 18 años o tener autorización parental</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de sus credenciales</li>
              <li>Responsabilizarse de toda actividad en su cuenta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Uso Aceptable</h2>
            <p>Se compromete a NO:</p>
            <ul>
              <li>Publicar contenido ofensivo, ilegal o que infrinja derechos de terceros</li>
              <li>Hacer spam o enviar mensajes no solicitados</li>
              <li>Interferir con el funcionamiento de la plataforma</li>
              <li>Crear cuentas falsas o múltiples</li>
              <li>Compartir información confidencial de otros usuarios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contenido del Usuario</h2>
            <p>
              Al publicar contenido en {APP_CONFIG.nameCapitalized}, usted declara que:
            </p>
            <ul>
              <li>Es el propietario o tiene derecho a usar dicho contenido</li>
              <li>El contenido no infringe derechos de terceros</li>
              <li>Nos otorga licencia para usar, mostrar y distribuir su contenido</li>
            </ul>
            <p>
              Nos reservamos el derecho a moderar, editar o eliminar contenido que viole estos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propiedad Intelectual</h2>
            <p>
              Todos los elementos de la plataforma (diseño, código, logotipos, etc.) son propiedad 
              de {APP_CONFIG.companyName} y están protegidos por las leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacidad</h2>
            <p>
              El tratamiento de sus datos personales se rige por nuestra{' '}
              <Link to={APP_CONFIG.privacyPolicyUrl} className="text-primary hover:underline">
                Política de Privacidad
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho a modificar estos términos en cualquier momento. 
              Las modificaciones serán efectivas al ser publicadas en la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Suspensión y Terminación</h2>
            <p>
              Podemos suspender o terminar su cuenta si viola estos términos o por cualquier 
              razón justificada, con notificación previa cuando sea posible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitación de Responsabilidad</h2>
            <p>
              {APP_CONFIG.companyName} no se responsabiliza por daños indirectos, lucro cesante 
              o cualquier pérdida derivada del uso de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos términos se rigen por la legislación española. Para cualquier disputa, 
              las partes se someten a los tribunales de Barcelona.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos, contacte con nosotros en:
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

export default TermsConditions;
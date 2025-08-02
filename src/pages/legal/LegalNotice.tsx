import { APP_CONFIG } from '@/config/app';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';

const LegalNotice = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Aviso Legal
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Datos Identificativos</h2>
            <p>
              En cumplimiento de lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio, 
              de Servicios de la Sociedad de la Información y del Comercio Electrónico, se informa:
            </p>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p><strong>Denominación social:</strong> {APP_CONFIG.companyName}</p>
              <p><strong>NIF:</strong> {APP_CONFIG.nif}</p>
              <p><strong>Domicilio:</strong> {APP_CONFIG.address}</p>
              <p><strong>Email:</strong> {APP_CONFIG.contactEmail}</p>
              <p><strong>Teléfono:</strong> {APP_CONFIG.phone}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Objeto</h2>
            <p>
              {APP_CONFIG.companyName} es titular del sitio web {window.location.hostname} y 
              de la plataforma {APP_CONFIG.nameCapitalized}, una red social gastronómica que 
              ofrece servicios de intercambio de contenido, recetas, reseñas de restaurantes 
              y comunicación entre usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Condiciones de Acceso y Uso</h2>
            <p>
              El acceso y uso de este sitio web se rige por la legalidad vigente y por el 
              principio de buena fe, comprometiéndose el usuario a hacer un buen uso de la web.
            </p>
            <p>
              Quedan prohibidos todos los actos que vulneren la legalidad, derechos o intereses 
              de terceros: derecho a la intimidad, protección de datos, propiedad intelectual, etc.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Responsabilidad</h2>
            <p>
              {APP_CONFIG.companyName} no se hace responsable de:
            </p>
            <ul>
              <li>La veracidad, exactitud o actualización de los contenidos</li>
              <li>La idoneidad o utilidad de los contenidos para actividades específicas</li>
              <li>Los daños producidos por el acceso o uso de la web</li>
              <li>Los contenidos publicados por usuarios de la plataforma</li>
              <li>Las decisiones tomadas en base a la información proporcionada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Propiedad Intelectual e Industrial</h2>
            <p>
              Todos los contenidos del sitio web (textos, imágenes, sonidos, audio, vídeo, 
              diseños, creatividades, software, etc.) y las marcas, nombres comerciales o 
              signos distintivos son propiedad de {APP_CONFIG.companyName} o de terceros, 
              sin que puedan entenderse cedidos al usuario ninguno de los derechos de 
              explotación existentes sobre los mismos.
            </p>
            <p>
              El uso no autorizado de la información contenida en este sitio, así como los 
              perjuicios causados en los derechos de propiedad intelectual e industrial de 
              {APP_CONFIG.companyName}, puede dar lugar al ejercicio de las acciones que 
              legalmente correspondan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Enlaces</h2>
            <p>
              En el caso de que en la web se dispusiesen enlaces o hipervínculos hacia otros 
              sitios de Internet, {APP_CONFIG.companyName} no ejercerá ningún tipo de control 
              sobre dichos sitios y contenidos.
            </p>
            <p>
              En ningún caso {APP_CONFIG.companyName} asumirá responsabilidad alguna por los 
              contenidos de algún enlace perteneciente a un sitio web ajeno.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Política de Privacidad</h2>
            <p>
              {APP_CONFIG.companyName} garantiza el cumplimiento de la normativa en materia 
              de protección de datos de carácter personal. Para más información, consulte 
              nuestra{' '}
              <Link to={APP_CONFIG.privacyPolicyUrl} className="text-primary hover:underline">
                Política de Privacidad
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Modificaciones</h2>
            <p>
              {APP_CONFIG.companyName} se reserva el derecho a realizar sin previo aviso las 
              modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir 
              o añadir tanto los contenidos y servicios que se presten a través de la misma 
              como la forma en la que éstos aparezcan presentados o localizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Legislación Aplicable y Jurisdicción</h2>
            <p>
              La relación entre {APP_CONFIG.companyName} y el usuario se regirá por la 
              normativa española vigente. En caso de disputa, ambas partes se someterán 
              a los Juzgados y Tribunales de Barcelona.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
            <p>
              Para cualquier comunicación relacionada con este aviso legal, puede contactar 
              con nosotros a través de:
            </p>
            <p>
              Email: {APP_CONFIG.contactEmail}<br />
              Teléfono: {APP_CONFIG.phone}<br />
              Dirección postal: {APP_CONFIG.address}
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
            <Link to={APP_CONFIG.cookiesPolicyUrl} className="text-primary hover:underline">
              Política de Cookies
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

export default LegalNotice;
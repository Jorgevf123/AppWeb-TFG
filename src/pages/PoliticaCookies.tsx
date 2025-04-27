import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PoliticaCookies = () => {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-petblue mb-6">Política de Cookies</h1>

        <p>Esta página web utiliza cookies para mejorar la experiencia de usuario y asegurar el correcto funcionamiento de la plataforma.</p>

        <h2 className="text-2xl font-semibold mt-6">¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Permiten reconocer tu dispositivo y recordar tus preferencias.</p>

        <h2 className="text-2xl font-semibold mt-6">Cookies utilizadas en PetTravelBuddy</h2>
        <ul className="list-disc list-inside">
          <li>Cookies técnicas: necesarias para el funcionamiento básico (login, sesión).</li>
          <li>Cookies analíticas: utilizadas para mejorar el rendimiento de la plataforma (si decides implementar estadísticas).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Gestión de Cookies</h2>
        <p>Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies. La desactivación de cookies puede afectar algunas funcionalidades del sitio web.</p>
      </div>
      <Footer />
    </>
  );
};

export default PoliticaCookies;

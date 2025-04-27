import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PoliticaPrivacidad = () => {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-petblue mb-6">Política de Privacidad</h1>

        <p>En PetTravelBuddy nos comprometemos a proteger tu información personal y a usarla únicamente para ofrecerte un mejor servicio.</p>

        <h2 className="text-2xl font-semibold mt-6">Información Recopilada</h2>
        <p>Recopilamos tu nombre, apellidos, correo electrónico, fecha de nacimiento, ubicación y foto de perfil. También recopilamos datos relacionados con solicitudes y acompañamientos.</p>

        <h2 className="text-2xl font-semibold mt-6">Uso de la Información</h2>
        <p>Utilizamos tus datos para gestionar tu cuenta, facilitar solicitudes de acompañamiento, mejorar nuestros servicios y enviarte notificaciones importantes.</p>

        <h2 className="text-2xl font-semibold mt-6">Compartición de Datos</h2>
        <p>No compartimos tu información personal con terceros salvo obligación legal o consentimiento explícito.</p>

        <h2 className="text-2xl font-semibold mt-6">Tus Derechos</h2>
        <p>Puedes acceder, corregir o solicitar la eliminación de tus datos en cualquier momento escribiéndonos a pettravelbuddy.notif@gmail.com.</p>

        <h2 className="text-2xl font-semibold mt-6">Cambios en la Política</h2>
        <p>Nos reservamos el derecho de actualizar esta Política de Privacidad. Te avisaremos de cualquier cambio importante.</p>
      </div>
      <Footer />
    </>
  );
};

export default PoliticaPrivacidad;

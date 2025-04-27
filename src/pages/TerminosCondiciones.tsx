import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TerminosCondiciones = () => {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-petblue mb-6">Términos y Condiciones</h1>

        <p>Bienvenido a PetTravelBuddy. Al utilizar nuestra plataforma, aceptas cumplir estos Términos y Condiciones.</p>

        <h2 className="text-2xl font-semibold mt-6">Uso de la Plataforma</h2>
        <p>PetTravelBuddy ofrece un servicio de conexión entre clientes que necesitan trasladar a sus mascotas y acompañantes dispuestos a realizar el acompañamiento en viajes por avión o tren.</p>

        <h2 className="text-2xl font-semibold mt-6">Responsabilidad</h2>
        <p>PetTravelBuddy actúa únicamente como intermediario y no se responsabiliza de posibles daños, pérdidas o incidentes ocurridos durante el viaje. Los usuarios son responsables de verificar la información proporcionada y coordinar los detalles del traslado.</p>

        <h2 className="text-2xl font-semibold mt-6">Registro de Usuarios</h2>
        <p>Para utilizar nuestros servicios, debes registrarte proporcionando datos verídicos. PetTravelBuddy se reserva el derecho de suspender o eliminar cuentas que infrinjan nuestras normas o presenten comportamiento inapropiado.</p>

        <h2 className="text-2xl font-semibold mt-6">Modificaciones</h2>
        <p>Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento. Te notificaremos en caso de cambios importantes.</p>
      </div>
      <Footer />
    </>
  );
};

export default TerminosCondiciones;

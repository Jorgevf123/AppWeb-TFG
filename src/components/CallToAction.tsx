import { Button } from '@/components/ui/button';
import { Dog, Cat, Plane, Train } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const CallToAction = () => {
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("rol");
    setRol(r);
  }, []);

  return (
    <section className="py-20 bg-petblue text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 transform -rotate-12">
          <Dog className="h-24 w-24" />
        </div>
        <div className="absolute top-40 right-20">
          <Cat className="h-20 w-20" />
        </div>
        <div className="absolute bottom-10 left-1/4">
          <Plane className="h-28 w-28" />
        </div>
        <div className="absolute bottom-20 right-1/4">
          <Train className="h-24 w-24" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Necesitas enviar a tu mascota a otra ciudad?
          </h2>

          <p className="text-xl mb-8 text-white/90">
            Deja que nuestros profesionales se encarguen de todo el proceso sin que tengas que viajar. Tu mascota llegará segura a su destino con nuestro servicio de acompañamiento especializado.
          </p>

          {rol === 'cliente' || !rol ? (
            <Button size="lg" className="bg-white text-petblue hover:bg-gray-100 text-lg font-semibold px-8" onClick={() => window.location.href = '/#acompanantes'}>
              Reservar Envío
            </Button>
          ) : (
            <p className="text-white text-lg mt-6 italic opacity-80">
              Sólo los clientes pueden reservar envíos.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-2">
                <Dog className="h-4 w-4 text-petblue" />
              </div>
              <span className="text-sm text-white/80">Más de 5.000 mascotas transportadas</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-2">
                <Plane className="h-4 w-4 text-petblue" />
              </div>
              <span className="text-sm text-white/80">Cobertura en toda España</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
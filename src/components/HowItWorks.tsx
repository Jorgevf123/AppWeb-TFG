
import React from 'react';
import { Calendar, CheckCircle, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: <Calendar className="h-10 w-10 text-petblue" />,
    title: "Reserva el servicio",
    description: "Selecciona la fecha, origen y destino de tu viaje, y proporciona los detalles de tu mascota."
  },
  {
    icon: <User className="h-10 w-10 text-petblue" />,
    title: "Asignamos un acompañante",
    description: "Te presentamos a la persona que cuidará de tu mascota durante el viaje. Todos nuestros acompañantes están verificados."
  },
  {
    icon: <MapPin className="h-10 w-10 text-petblue" />,
    title: "Entrega y seguimiento",
    description: "Entrega a tu mascota en el punto de encuentro y sigue su viaje en tiempo real a través de nuestra aplicación."
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-petblue" />,
    title: "Recogida segura",
    description: "Tu mascota será entregada únicamente a la persona autorizada en el destino. Recibirás una notificación cuando esto ocurra."
  }
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-petblue mb-4">Cómo Funciona</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un proceso simple y seguro para que tu mascota viaje con la mejor compañía
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 bg-petgreen/20 p-4 rounded-full">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-petblue">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="mt-4 bg-petblue text-white text-lg font-bold rounded-full h-8 w-8 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

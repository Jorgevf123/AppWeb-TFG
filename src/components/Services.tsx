
import React from 'react';
import { Check, Plane, Train, Dog, Cat, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const servicesData = [
  {
    icon: <Plane className="h-10 w-10 text-white" />,
    title: "Acompañamiento en Avión",
    description: "Nuestro personal se encargará de todos los trámites necesarios para que tu mascota viaje segura en la bodega del avión o en cabina según las normas de la aerolínea.",
    features: [
      "Papeleo y documentación",
      "Facturación especial para mascotas",
      "Entrega en destino",
      "Seguimiento en tiempo real"
    ],
    price: "Desde 79€",
    ctaText: "Reservar para Avión",
    bgColor: "bg-petblue",
    btnColor: "bg-white text-petblue hover:bg-gray-100"
  },
  {
    icon: <Train className="h-10 w-10 text-white" />,
    title: "Acompañamiento en Tren",
    description: "Nuestros acompañantes se asegurarán de que tu mascota viaje cómoda y tranquila en los vagones habilitados para animales según la normativa de RENFE u otros operadores.",
    features: [
      "Gestión de billetes especiales",
      "Colocación en zona habilitada",
      "Paseos durante paradas largas",
      "Alimentación si es necesario"
    ],
    price: "Desde 59€",
    ctaText: "Reservar para Tren",
    bgColor: "bg-petgreen-dark",
    btnColor: "bg-white text-petgreen-dark hover:bg-gray-100"
  }
];

const Services = () => {
  return (
    <section id="servicios" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-petblue mb-4">Nuestros Servicios</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos soluciones personalizadas para el traslado de tu mascota, ya sea en avión o tren
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {servicesData.map((service, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-xl">
              <CardHeader className={`${service.bgColor} text-white py-6`}>
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-3 rounded-full">{service.icon}</div>
                  <div className="text-right">
                    <span className="block text-sm opacity-80">Precio</span>
                    <span className="text-xl font-bold">{service.price}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl mt-4">{service.title}</CardTitle>
                <CardDescription className="text-white/90">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${service.btnColor} font-semibold`} size="lg">
                  {service.ctaText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-xl p-6 md:p-8 max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold text-petblue mb-4 text-center">
            También cuidamos de...
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-md">
              <Dog className="h-10 w-10 text-petblue mb-3" />
              <h4 className="font-bold text-lg">Perros</h4>
              <p className="text-gray-600 text-sm">De todas las razas y tamaños</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-md">
              <Cat className="h-10 w-10 text-petblue mb-3" />
              <h4 className="font-bold text-lg">Gatos</h4>
              <p className="text-gray-600 text-sm">Con cuidados especiales</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-md">
              <Clock className="h-10 w-10 text-petblue mb-3" />
              <h4 className="font-bold text-lg">Viajes Largos</h4>
              <p className="text-gray-600 text-sm">Con seguimiento constante</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-md">
              <Shield className="h-10 w-10 text-petblue mb-3" />
              <h4 className="font-bold text-lg">Seguros</h4>
              <p className="text-gray-600 text-sm">Todos los viajes están asegurados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;

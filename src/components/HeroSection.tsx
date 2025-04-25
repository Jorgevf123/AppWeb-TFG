import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, Train, Dog, Cat } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 hero-gradient"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')] bg-cover bg-center opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="animate-float bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Dog className="h-10 w-10 md:h-12 md:w-12" />
            </div>
            <div className="animate-float bg-white/20 backdrop-blur-sm rounded-full p-4" style={{ animationDelay: "0.5s" }}>
              <Cat className="h-10 w-10 md:h-12 md:w-12" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Envía a tu mascota a cualquier destino sin tener que viajar con ella
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Servicio de transporte y acompañamiento profesional para mascotas en aviones y trenes por toda España
          </p>

          {rol === "acompanante" ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/acompanante/viaje/avion")}
                className="bg-white text-petblue hover:bg-gray-100 text-lg font-semibold"
              >
                <Plane className="mr-2 h-5 w-5" />
                Servicio para Avión
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/acompanante/viaje/tren")}
                className="bg-petgreen text-petblue-dark hover:bg-petgreen-dark text-lg font-semibold"
              >
                <Train className="mr-2 h-5 w-5" />
                Servicio para Tren
              </Button>
            </div>
          ) : (
            <p className="text-white text-lg mt-6 italic opacity-80">
              Podrás acceder a estos servicios sólo si eres acompañante.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


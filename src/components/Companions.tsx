import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';


interface Acompanante {
  _id: string;
  nombre: string;
  imagenPerfil: string;
  mediaValoracion: number | null;
  numeroValoraciones: number;
  tiempoEnPlataforma?: string;
}

const Companions = () => {
  const navigate = useNavigate();
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);
  const [rol, setRol] = useState<string | null>(localStorage.getItem("rol"));


  useEffect(() => {
    const fetchAcompanantes = async () => {
      try {
        const res = await axios.get("/api/matches/acompanantes-cercanos?lat=40.4168&lng=-3.7038");
        setAcompanantes(res.data);
      } catch (err) {
        console.error("Error cargando acompañantes:", err);
      }
    };
    fetchAcompanantes();
  }, []);

  return (
    <section id="acompanantes" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-petblue mb-4">Nuestros Acompañantes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acompañantes verificados y amantes de los animales que cuidarán de tu mascota como si fuera suya
          </p>
        </div>
        {rol !== "cliente" ? (
          <p className="text-center text-gray-600 italic">
            Solo los clientes pueden ver la lista de acompañantes.
          </p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {acompanantes.length > 0 ? (
            acompanantes.map((acompanante) => (
              <Card key={acompanante._id} className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-petblue">
                        <AvatarImage src={acompanante.imagenPerfil || "https://placehold.co/100x100"} alt={acompanante.nombre} />
                        <AvatarFallback>
                          {acompanante.nombre.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-petblue">{acompanante.nombre}</h3>
                        {acompanante.tiempoEnPlataforma && (
                          <p className="text-sm text-gray-500">{acompanante.tiempoEnPlataforma}</p>
                        )}
                        {acompanante.mediaValoracion !== null && (
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{acompanante.mediaValoracion}</span>
                            <span className="text-gray-500 text-sm">({acompanante.numeroValoraciones} reseñas)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-petblue border-petblue hover:bg-petblue hover:text-white transition-colors"
                    onClick={() => navigate(`/perfil/${acompanante._id}`)}
                  >
                    Ver Perfil
                  </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-600">No hay acompañantes disponibles ahora mismo.</p>
          )}
        </div>
        )}
      </div>
    </section>
  );
};

export default Companions;


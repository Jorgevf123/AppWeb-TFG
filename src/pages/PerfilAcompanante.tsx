import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";


const PerfilAcompanante = () => {
  const { id } = useParams<{ id: string }>();
  const [acompanante, setAcompanante] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");

  useEffect(() => {
    if (rol !== "cliente") {
      setError("Solo los clientes pueden acceder a esta sección.");
      return;
    }

    if (id) {
      axios.get(`/api/users/${id}`)
        .then(res => setAcompanante(res.data))
        .catch(err => console.error('Error cargando acompañante', err));
    }
  }, [id, rol]);
  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-8 max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-600 italic">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!acompanante) {
    return (
      <>
        <Navbar />
        <div className="p-8 max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-600 italic">Cargando perfil...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar/>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <Avatar className="h-24 w-24 mx-auto">
          <AvatarImage src={acompanante.imagenPerfil || 'https://placehold.co/100x100'} />
          <AvatarFallback>{acompanante.nombre.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mt-4">{acompanante.nombre}</h1>
        {acompanante.bio && (
          <p className="text-gray-600 mt-2">{acompanante.bio}</p>
        )}
      </div>
      <Link
        to={`/solicitud/${acompanante._id}`}
        className="block bg-petblue text-white py-2 px-4 rounded w-full text-center mt-6"
      >
        Solicitar Acompañante
      </Link>

    </div>
    <Footer/>
    </>
  );
};

export default PerfilAcompanante;

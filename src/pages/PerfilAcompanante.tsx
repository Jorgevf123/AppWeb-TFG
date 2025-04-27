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
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`/api/users/${id}`)
        .then(res => setAcompanante(res.data))
        .catch(err => console.error('Error cargando acompañante', err));
    }
  }, [id]);

  if (!acompanante) return <p>Cargando...</p>;

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

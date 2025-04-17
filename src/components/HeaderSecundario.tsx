import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, User } from 'lucide-react';
import axios from 'axios';

const HeaderSecundario = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };  

  const handleIconClick = () => {
    inputRef.current?.click();
  };

  const handleImagenSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagenPerfil(base64);

      try {
        await axios.put(
          'http://localhost:5000/api/auth/actualizar-foto',
          { fotoPerfil: base64 },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } catch (err) {
        console.error('Error al subir imagen:', err);
      }
    };
    reader.readAsDataURL(archivo);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data.fotoPerfil) {
        setImagenPerfil(res.data.fotoPerfil);
      }
    })
    .catch(err => {
      console.error('Error al cargar imagen:', err);
    });
  }, []);

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo e inicio */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="text-petblue">
            <Plane className="h-6 w-6 inline-block mr-1" />
            <Train className="h-6 w-6 inline-block" />
          </div>
          <span className="font-montserrat font-bold text-xl text-petblue">
            PetTravelBuddy
          </span>
        </div>

        {/* Enlaces navegación */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="/#como-funciona" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Cómo Funciona
          </a>
          <a href="#servicios" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Servicios
          </a>
          <a href="#acompanantes" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Acompañantes
          </a>
          <a href="#faq" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            FAQ
          </a>
        </div>

        {/* Perfil + logout */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-petblue hover:bg-petblue-light text-white font-medium rounded transition"
          >
            Cerrar sesión
          </button>

          <div
            onClick={handleIconClick}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:shadow cursor-pointer overflow-hidden"
          >
            {imagenPerfil ? (
              <img src={imagenPerfil} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleImagenSeleccionada}
            className="hidden"
          />
        </div>
      </div>
    </nav>
  );
};

export default HeaderSecundario;



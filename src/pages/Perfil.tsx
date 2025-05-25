import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";


const Perfil = () => {
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const imagenGuardada = localStorage.getItem("imagenPerfil");
    if (imagenGuardada) setImagenPerfil(imagenGuardada);
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagenPerfil(base64);
        localStorage.setItem("imagenPerfil", base64);
        await fetch("/api/auth/actualizar-foto", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ imagenPerfil: base64 }),
          });          
  
        try {
          const userId = localStorage.getItem("userId");
          await fetch(`/api/usuarios/${userId}/imagen`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imagen: base64 }),
          });
        } catch (err) {
          console.error("Error al guardar imagen:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };  

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="flex flex-col items-center">
            {/* Imagen o icono */}
            <div className="relative mb-4">
              {imagenPerfil ? (
                <img
                  src={imagenPerfil}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full object-cover shadow"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl shadow">
                  <User className="h-12 w-12" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-semibold text-petblue mb-1">{nombre}</h2>
            <p className="text-gray-500 text-sm mb-6">Perfil del usuario</p>

            <label className="w-full bg-petblue text-white py-2 px-4 rounded hover:bg-petblue-light transition text-center cursor-pointer">
              Cambiar foto de perfil
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <button
              onClick={() => navigate("/editar-perfil")}
              className="mt-4 w-full border border-petblue text-petblue py-2 px-4 rounded hover:bg-petblue hover:text-white transition text-center"
            >
              Editar datos personales
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Perfil;


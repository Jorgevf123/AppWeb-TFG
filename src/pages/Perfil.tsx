import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


const Perfil = () => {
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";


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
        await fetch(`${baseUrl}/api/auth/actualizar-foto`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ imagenPerfil: base64 }),
          });          
  
        try {
          const userId = localStorage.getItem("userId");
          await fetch(`${baseUrl}/api/usuarios/${userId}/imagen`, {
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
  const handleDeleteAccount = async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${baseUrl}/api/usuarios/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al eliminar cuenta");

    localStorage.clear();
    navigate("/");
    toast.success("Cuenta eliminada correctamente.");
  } catch (err) {
    console.error("Error al eliminar cuenta:", err);
    toast.error("Hubo un problema al eliminar tu cuenta.");
  }
};
 

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="flex flex-col items-center">
            {}
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
            <button
              onClick={() => setShowConfirmModal(true)}
              className="mt-4 w-full border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-600 hover:text-white transition text-center"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
      {showConfirmModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">¿Eliminar cuenta?</h3>
      <p className="text-sm text-gray-600 mb-6">
        Esta acción no se puede deshacer. Se eliminarán tus datos de forma permanente.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowConfirmModal(false)}
          className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            setShowConfirmModal(false);
            handleDeleteAccount();
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}
      <Footer />
    </>
  );
};

export default Perfil;


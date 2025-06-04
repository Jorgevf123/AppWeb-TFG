import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/utils/api";

const RestablecerContrasena = () => {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await api.post("/api/auth/restablecer-contrasena", { token, nuevaPassword });
    toast.success("Contraseña actualizada");
    setTimeout(() => navigate("/login"), 1500);
  } catch (err: any) {
    toast.error(err?.response?.data?.error || "Error");
  }
};

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-petblue">Nueva contraseña</h2>

          <label className="block mb-2 font-medium">Contraseña nueva</label>
          <input
            type="password"
            required
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <button
            type="submit"
            className="w-full bg-petblue hover:bg-petblue-light text-white py-2 rounded transition"
          >
            Restablecer
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default RestablecerContrasena;

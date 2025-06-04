import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/utils/api";

const OlvideContrasena = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await api.post("/api/auth/olvide-contrasena", { email }); 
    toast.success("Revisa tu correo para recuperar la contraseña.");
  } catch (err: any) {
    toast.error(err?.response?.data?.error || "Error al enviar el correo");
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
          <h2 className="text-2xl font-bold mb-6 text-center text-petblue">Recuperar contraseña</h2>

          <label className="block mb-2 font-medium">Introduce tu email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <button
            type="submit"
            className="w-full bg-petblue hover:bg-petblue-light text-white py-2 rounded transition"
          >
            Enviar enlace
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default OlvideContrasena;

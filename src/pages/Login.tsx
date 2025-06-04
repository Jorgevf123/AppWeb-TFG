import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = new URLSearchParams(location.search).get("admin") === "true";

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const res = await fetch(`${baseUrl}/api/auth/login`, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : {};

    if (!res.ok || !data?.user) {
      toast.warning(data?.error || "Error al iniciar sesión");
      return;
    }

    const user = data.user;

    if (isAdminRoute && user.rol !== "admin") {
      toast.error("Acceso restringido. Solo los administradores pueden acceder aquí.");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", user.rol);
    localStorage.setItem("nombre", user.nombre);
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("imagenPerfil", user.imagenPerfil || "");

    toast.success("Inicio de sesión exitoso");

    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1200);
  } catch (err) {
    console.error(err);
    toast.error("Error en el servidor");
  }
};

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-petblue">
            Iniciar Sesión
          </h2>

          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block mb-2 font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mb-6"
          />

          <button
            type="submit"
            className="w-full bg-petblue hover:bg-petblue-light text-white py-2 rounded transition"
          >
            Entrar
          </button>
          <p
            className="text-sm text-petblue mt-4 text-center cursor-pointer underline hover:text-petblue-light"
            onClick={() => navigate("/olvide-contrasena")}
          >
            ¿Has olvidado tu contraseña?
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;




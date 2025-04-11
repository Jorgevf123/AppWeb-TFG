import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("userId", data.userId);


        // Redirigir según el rol
        if (data.user.rol === "cliente") {
          navigate("/area-cliente");
        } else if (data.user.rol === "acompanante") {
          navigate("/area-acompanante");
        } else if (data.user.rol === "admin") {
          navigate("/admin");
        }
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      alert("Error en el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-petblue">Iniciar Sesión</h2>

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
      </form>
    </div>
  );
};

export default Login;

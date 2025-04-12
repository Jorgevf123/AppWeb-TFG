import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cliente");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const ubicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        try {
          const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password, rol, ubicacion }),
          });

          const data = await response.json();
          if (response.ok) {
            toast.success("Registro exitoso");
            setTimeout(() => navigate("/login"), 2000);
          } else {
            alert(data.error || "Error al registrarse");
          }
        } catch (err) {
          console.error(err);
          alert("Error en el servidor");
        }
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error);
        alert("Es necesario permitir el acceso a la ubicación para registrarse como acompañante.");
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-petblue">Crear Cuenta</h2>

        <label className="block mb-2 font-medium">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full p-2 border rounded mb-4"
        />

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
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">Rol</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full p-2 border rounded mb-6"
        >
          <option value="cliente">Cliente</option>
          <option value="acompanante">Acompañante</option>
        </select>

        <button
          type="submit"
          className="w-full bg-petblue hover:bg-petblue-light text-white py-2 rounded transition"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Register;
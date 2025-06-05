import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cliente");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [dniFrontal, setDniFrontal] = useState<File | null>(null);
  const [dniTrasero, setDniTrasero] = useState<File | null>(null);
  const [aceptarTerminos, setAceptarTerminos] = useState(false);
  const navigate = useNavigate();

  const calcularEdad = (fecha: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptarTerminos) {
      toast.error("Debes aceptar los Términos y Condiciones para registrarte.");
      return;
    }    

    const edad = calcularEdad(fechaNacimiento);
    if (edad < 18) {
      toast.error("Debes tener al menos 18 años para registrarte.");
      return;
    }

    if (rol === "acompanante") {
      const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];

      if (!dniFrontal || !dniTrasero) {
        toast.error("Debes subir ambas caras del DNI para registrarte como acompañante.");
        return;
      }

      if (
        !tiposPermitidos.includes(dniFrontal.type) ||
        !tiposPermitidos.includes(dniTrasero.type)
      ) {
        toast.error("Los archivos del DNI deben ser JPG, PNG o PDF.");
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const ubicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("apellidos", apellidos);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("rol", rol);
        formData.append("fechaNacimiento", fechaNacimiento);
        formData.append("ubicacion", JSON.stringify(ubicacion));

        if (dniFrontal) formData.append("dniFrontal", dniFrontal);
        if (dniTrasero) formData.append("dniTrasero", dniTrasero);

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (response.ok) {
            toast.success("Registro exitoso");
            setTimeout(() => navigate("/login"), 2000);
          } else {
            toast.error(data.error || "Error al registrarse");
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
    <>
      <Navbar />
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

          <label className="block mb-2 font-medium">Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block mb-2 font-medium">Fecha de Nacimiento</label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
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
            className="w-full p-2 border rounded mb-4"
          >
            <option value="cliente">Cliente</option>
            <option value="acompanante">Acompañante</option>
          </select>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={aceptarTerminos}
              onChange={(e) => setAceptarTerminos(e.target.checked)}
              required
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              Acepto los <a href="/terminos-condiciones" className="text-petgreen underline" target="_blank">Términos y Condiciones</a> y la <a href="/politica-privacidad" className="text-petgreen underline" target="_blank">Política de Privacidad</a>.
            </label>
          </div>

          {rol === "acompanante" && (
            <>
              <label className="block mb-2 font-medium">DNI (anverso)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDniFrontal(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded mb-4"
              />

              <label className="block mb-2 font-medium">DNI (reverso)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDniTrasero(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded mb-6"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-petblue hover:bg-petblue-light text-white py-2 rounded transition"
          >
            Registrarse
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Register;


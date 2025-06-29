import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";


const EditarPerfil = () => {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rol, setRol] = useState("cliente");
  const [bio, setBio] = useState("");
  const [rolOriginal, setRolOriginal] = useState("cliente");
  const [dniFrontal, setDniFrontal] = useState<File | null>(null);
  const [dniTrasero, setDniTrasero] = useState<File | null>(null);



  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNombre(data.nombre);
        setApellidos(data.apellidos);
        setEmail(data.email);
        setFechaNacimiento(data.fechaNacimiento?.split("T")[0] || ""); 
        setRol(data.rol);
        setBio(data.bio || "");
        setRolOriginal(data.rol);
        setRol(data.rol);

      } catch (err) {
        console.error("Error al cargar el perfil", err);
      }
    };

    fetchPerfil();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (rol !== rolOriginal && rol === "acompanante") {
    const formData = new FormData();
    formData.append("rolPendiente", "acompanante");
    formData.append("nombre", nombre);
    formData.append("apellidos", apellidos);
    formData.append("email", email);
    formData.append("fechaNacimiento", fechaNacimiento);
    formData.append("bio", bio);
    if (dniFrontal) formData.append("dniFrontal", dniFrontal);
    if (dniTrasero) formData.append("dniTrasero", dniTrasero);

    const res = await fetch(`${baseUrl}/api/auth/solicitar-cambio-rol`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      toast.success("Solicitud de cambio de rol enviada. Un admin la revisará.");
      navigate("/perfil");
    } else {
      toast.error("Error al solicitar cambio de rol");
    }
    return;
  }
  try {
    const res = await fetch(`${baseUrl}/api/auth/actualizar-perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre, apellidos, email, fechaNacimiento, rol, bio }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Datos actualizados correctamente");
      navigate("/perfil");
    } else {
      toast.error(data.error || "Error al actualizar perfil");
    }
  } catch (err) {
    console.error("Error", err);
    toast.error("Error en la conexión");
  }
};

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleGuardar}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-petblue">Editar Datos Personales</h2>

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

          <label className="block mb-2 font-medium">Fecha de nacimiento</label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
          <label className="block mb-2 font-medium">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Cuéntanos algo sobre ti..."
            rows={3}
          />
          <label className="block mb-2 font-medium">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {rol === "acompanante" && rolOriginal !== "acompanante" && (
            <>
              <label className="block mb-2 font-medium">DNI Anverso</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setDniFrontal(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded mb-4"
              />

              <label className="block mb-2 font-medium">DNI Reverso</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setDniTrasero(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded mb-6"
              />
            </>
          )}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-petblue hover:bg-petblue-light text-white font-medium py-2 px-4 rounded"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditarPerfil;


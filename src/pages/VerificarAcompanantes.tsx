import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  dniFrontal: string;
  dniTrasero: string;
  rol: string;          
  rolPendiente?: string;
}

const VerificarAcompanantes = () => {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "admin") navigate("/");

    const token = localStorage.getItem("token");
    const fetchPendientes = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/admin/acompanantes-pendientes`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Respuesta inválida del backend (no JSON)");
        }

        const data = await res.json();

        if (res.ok) {
          setUsuarios(data);
        } else {
          alert(data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Error al obtener acompañantes.");
      }
    };

    fetchPendientes();
  }, []);

  const handleVerificar = async (id: string, estado: "aprobado" | "rechazado") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/admin/verificar-acompanante/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (_) {
        data = {};
      }

      if (res.ok) {
        setUsuarios((prev) => prev!.filter((u) => u._id !== id));
        toast.success(`Acompañante ${estado} correctamente.`);
      } else {
        toast.error(data.error || "Error al procesar verificación");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar verificación");
    }
  };  

  return (
    <>  
    <Navbar />
    <div className="p-6">
      <h1 className="text-2xl font-bold text-petblue mb-6">Solicitudes Pendientes</h1>
      {usuarios === null ? (
        <p>Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        Array.isArray(usuarios) && usuarios.map((u) => (
          <div key={u._id} className="bg-white p-4 shadow rounded mb-4">
            <p><strong>{u.nombre} {u.apellidos}</strong></p>
            <p>Email: {u.email}</p>
            <p className="text-sm text-gray-500 italic">
              {u.rol === "cliente" && u.rolPendiente === "acompanante"
                ? "Solicitud de cambio de rol a acompañante"
                : "Solicitud de registro como acompañante"}
            </p>
            <div className="flex gap-4 my-2">
            <a
                href={`${baseUrl}/uploads/${u.dniFrontal}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
            >
                Ver DNI Anverso
            </a>

            <a
                href={`${baseUrl}/uploads/${u.dniTrasero}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
            >
                Ver DNI Reverso
            </a>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleVerificar(u._id, "aprobado")}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Aprobar
              </button>
              <button
                onClick={() => handleVerificar(u._id, "rechazado")}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    <Footer />
    </>
  );
};

export default VerificarAcompanantes;


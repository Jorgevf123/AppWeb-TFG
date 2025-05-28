import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { FaFlag } from "react-icons/fa";
import { toast } from "sonner";

const socket = io(
  window.location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "https://18.214.63.24:5000",
  { transports: ["websocket"] }
);

const AreaAcompañante = () => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [solicitudesAceptadas, setSolicitudesAceptadas] = useState([]);
  const [paginaValoraciones, setPaginaValoraciones] = useState(1);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [clienteAReportar, setClienteAReportar] = useState<string | null>(null);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [nombreCliente, setNombreCliente] = useState<string | null>(null);
  const valoracionesPorPagina = 4;
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const id = localStorage.getItem("userId");
  setUserId(id);
}, []);


  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/solicitudes/${userId}`)
      .then(res => {
        const pendientes = res.data.filter((s: any) => s.estado === "pendiente");
        const aceptadas = res.data.filter((s: any) => s.estado === "aceptada" || s.estado === "finalizada");
        setSolicitudesPendientes(pendientes);
        setSolicitudesAceptadas(aceptadas);
      })
      .catch(err => console.error("Error al cargar solicitudes", err));
  }, [userId, paginaValoraciones]);

  useEffect(() => {
    if (!userId) return;
    socket.emit("usuarioOnline", userId);
    window.addEventListener("beforeunload", () => {
      socket.emit("usuarioOffline", userId);
    });
    return () => {
      socket.emit("usuarioOffline", userId);
      socket.disconnect();
    };
  }, []);

  const aceptarSolicitud = async (id: string, clienteId: string) => {
    await axios.put(`/api/solicitudes/${id}`, { estado: "aceptada" });
    window.location.reload();
  };

  const rechazarSolicitud = async (id: string, clienteId: string) => {
    await axios.put(`/api/solicitudes/${id}`, { estado: "rechazada" });
    window.location.reload();
  };

  const finalizarEntrega = async (matchId: string) => {
  console.log("Match ID recibido en finalizarEntrega:", matchId);
  try {
    const response = await axios.put(`/api/matches/finalizar/${matchId}`);
    console.log("Respuesta del backend:", response.data);
    toast.success("Trayecto finalizado correctamente.");
    window.location.reload();
  } catch (err: any) {
    console.error("Error al finalizar entrega", err);
    console.log("Error response data:", err.response?.data);
    alert(err.response?.data?.error || "Error al finalizar la entrega.");
  }
};

  const enviarReporte = async () => {
    if (!clienteAReportar || !motivoReporte.trim()) return;
  
    try {
      await axios.post("/api/reportes", {
        remitenteId: userId,
        denunciadoId: clienteAReportar,
        motivo: motivoReporte,
        rol: "acompanante"
      });
      toast.success("Reporte enviado correctamente.");
      setMostrarModalReporte(false);
      setMotivoReporte("");
      setClienteAReportar(null);
      setNombreCliente(null);
    } catch (err) {
      console.error("Error al enviar reporte", err);
      toast.error("No se pudo enviar el reporte.");
    }
  };

  

  // Filtrar solo las solicitudes que tengan una valoración registrada
const valoraciones = solicitudesAceptadas.filter((s: any) => 
  s.estado === "finalizada" && 
  s.matchId?.valoracionCliente && 
  s.valoracionPendiente === false
);
const valoracionesUnicas = valoraciones.filter((v, index, self) =>
  index === self.findIndex((t) => (
    t.matchId._id.toString() === v.matchId._id.toString()
  ))
);

  const valoracionesOrdenadas = [...valoraciones].reverse();
  const valoracionesMostradas = valoracionesOrdenadas.slice(
    (paginaValoraciones - 1) * valoracionesPorPagina,
    paginaValoraciones * valoracionesPorPagina
  );

  const totalPaginas = Math.ceil(valoraciones.length / valoracionesPorPagina);


  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-petblue">Área de Acompañante</h1>

        {/* Solicitudes Pendientes */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Solicitudes de Clientes</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solicitudesPendientes.length > 0 ? (
              Array.isArray(solicitudesPendientes) && solicitudesPendientes.map((s: any) => (
                <li key={s._id} className="bg-gray-50 p-4 rounded shadow-sm">
                  <p className="font-medium text-petblue">{s.clienteId?.nombre}</p>
                  <p className="text-sm text-gray-700">Tipo: {s.tipoAnimal}</p>
                  <p className="text-sm text-gray-700">Raza: {s.raza}</p>
                  <p className="text-sm text-gray-700">Dimensiones: {s.dimensiones}</p>
                  <p className="text-sm text-gray-700">Vacunas al día: {s.vacunasAlDia ? "Sí" : "No"}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => aceptarSolicitud(s._id, s.clienteId._id)} className="text-white bg-petblue px-3 py-1 rounded">Aceptar</button>
                    <button onClick={() => rechazarSolicitud(s._id, s.clienteId._id)} className="bg-red-500 text-white px-3 py-1 rounded">Rechazar</button>
                  </div>
                </li>
              ))
            ) : (
              <li>No hay solicitudes pendientes.</li>
            )}
          </ul>
        </section>

        {/* Solicitudes Aceptadas */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Solicitudes Aceptadas</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solicitudesAceptadas
  .filter((s: any) => s.estado === "aceptada" || (!s.matchId || !s.matchId.finalizado))
  .map((s: any) => (
              <li key={s._id} className="bg-gray-50 p-4 rounded shadow-sm">
                <p className="font-medium text-petblue flex items-center gap-2">
                  {s.clienteId?.nombre}
                  <button
                    title="Reportar"
                    onClick={() => {
                      setClienteAReportar(s.clienteId._id);
                      setNombreCliente(s.clienteId.nombre);
                      setMostrarModalReporte(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaFlag />
                  </button>
                </p>
                <p className="text-sm text-gray-700">Tipo: {s.tipoAnimal}</p>
                <p className="text-sm text-gray-700">Raza: {s.raza}</p>
                <p className="text-sm text-gray-700">Dimensiones: {s.dimensiones}</p>
                <p className="text-sm text-gray-700">Vacunas al día: {s.vacunasAlDia ? "Sí" : "No"}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => navigate(`/chat/${s.clienteId._id}`)} className="bg-green-500 text-white px-3 py-1 rounded">Chatear</button>
                  <button 
                    onClick={() => s.matchId && finalizarEntrega(s.matchId._id)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Finalizar Entrega
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Valoraciones Recibidas */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Valoraciones Recibidas</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {valoracionesMostradas.length > 0 ? (
              Array.isArray(valoracionesMostradas) && valoracionesMostradas.map((s: any) => (
                <li key={s._id} className="bg-white shadow p-4 rounded">
                  <p className="font-medium text-petblue">{s.clienteId?.nombre}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(s.matchId.valoracionCliente)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                    ))}
                  </div>
                  {s.matchId?.comentarioCliente && (
                    <p className="text-gray-600 text-sm italic mt-2">{s.matchId.comentarioCliente}</p>
                  )}
                </li>
              ))
            ) : (
              <li>No tienes valoraciones todavía.</li>
            )}
          </ul>

          {/* Controles de paginación */}
          {valoracionesUnicas.length > valoracionesPorPagina && (
    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={() => setPaginaValoraciones(p => Math.max(p - 1, 1))}
        disabled={paginaValoraciones === 1}
        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
      >
        Anterior
      </button>
      <button
        onClick={() => setPaginaValoraciones(p => Math.min(p + 1, totalPaginas))}
        disabled={paginaValoraciones === totalPaginas}
        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
      >
        Siguiente
      </button>
    </div>
  )}
        </section>

      </div>
      <Footer />
      {mostrarModalReporte && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
      <h2 className="text-lg font-bold text-center">Reportar Cliente</h2>
      <p className="text-center text-sm text-gray-600">
        Cliente: <span className="font-semibold">{nombreCliente}</span>
      </p>
      <textarea
        className="w-full border rounded p-2"
        rows={4}
        placeholder="Explica brevemente el motivo del reporte"
        value={motivoReporte}
        onChange={(e) => setMotivoReporte(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setMostrarModalReporte(false)}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={enviarReporte}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Enviar Reporte
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default AreaAcompañante;




  
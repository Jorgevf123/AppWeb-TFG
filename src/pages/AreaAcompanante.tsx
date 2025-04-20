import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderSecundario from "@/components/HeaderSecundario";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
});


const AreaAcompañante = () => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [solicitudesAceptadas, setSolicitudesAceptadas] = useState([]);
  const navigate = useNavigate();
  



  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:5000/api/solicitudes/${userId}`)
      .then(res => {
        const pendientes = res.data.filter((s: any) => s.estado === "pendiente");
        const aceptadas = res.data.filter((s: any) => s.estado === "aceptada");
        setSolicitudesPendientes(pendientes);
        setSolicitudesAceptadas(aceptadas);
      })
      .catch(err => {
        console.error("Error al cargar solicitudes", err);
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
  
    // 🔵 Avisa al servidor que el acompañante está conectado
    socket.emit("usuarioOnline", userId);

  
    // 🔴 Avisa al cerrar pestaña o refrescar
    window.addEventListener("beforeunload", () => {
      socket.emit("usuarioOffline", userId);
    });
  
    // 🧹 Limpieza en caso de cambio de página
    return () => {
      socket.emit("usuarioOffline", userId);
      socket.disconnect();
    };
  }, []);  

  const avisarCliente = async (clienteId: string, mensaje: string, solicitudId: string) => {
    try {
      await axios.post("http://localhost:5000/api/solicitudes/avisar-cliente", {
        clienteId,
        mensaje,
        solicitudId
      });
    } catch (error) {
      console.error("Error al avisar al cliente:", error);
    }
  };
  
  const aceptarSolicitud = async (id: string, clienteId: string) => {
    await axios.put(`http://localhost:5000/api/solicitudes/${id}`, { estado: "aceptada" });
    await avisarCliente(clienteId, "¡Tu solicitud ha sido aceptada!", id);
    window.location.reload();
  };
  
  const rechazarSolicitud = async (id: string, clienteId: string) => {
    await axios.put(`http://localhost:5000/api/solicitudes/${id}`, { estado: "rechazada" });
    await avisarCliente(clienteId, "Tu solicitud ha sido rechazada.", id);
    window.location.reload();
  };
  

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-petblue">Área de Acompañante</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Solicitudes de Clientes</h2>
          <ul className="bg-white shadow rounded-lg p-4 space-y-2">
            {solicitudesPendientes.length > 0 ? (
              solicitudesPendientes.map((s: any) => (
                <li key={s._id}>
                  {s.clienteId.nombre} ({s.tipoAnimal}, {s.raza})
                  <button
                    onClick={() => aceptarSolicitud(s._id, s.clienteId._id)}
                    className="ml-4 text-white bg-petblue px-2 py-1 rounded"
                  >
                    Aceptar
                  </button>
                </li>
              ))
            ) : (
              <li>No hay solicitudes pendientes.</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Solicitudes Aceptadas</h2>
          <ul className="bg-white shadow rounded-lg p-4 space-y-2">
            {solicitudesAceptadas.length > 0 ? (
              solicitudesAceptadas.map((s: any) => (
                <li key={s._id}>
                  {s.clienteId.nombre} ({s.tipoAnimal}, {s.raza})
                  <button
                    onClick={() => rechazarSolicitud(s._id, s.clienteId._id)}
                    className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => navigate(`/chat/${s.clienteId._id}`)}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Chatear
                  </button>
                </li>
              ))
            ) : (
              <li>No hay solicitudes aceptadas.</li>
            )}
          </ul>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AreaAcompañante;



  
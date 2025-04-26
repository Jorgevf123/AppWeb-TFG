import React, { useEffect, useState } from "react";
import axios from "axios";
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
  
    socket.emit("usuarioOnline", userId);

    window.addEventListener("beforeunload", () => {
      socket.emit("usuarioOffline", userId);
    });
  
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
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solicitudesPendientes.length > 0 ? (
              solicitudesPendientes.map((s: any) => (
                <li key={s._id} className="bg-gray-50 p-4 rounded shadow-sm">
                  <p className="font-medium text-petblue">{s.clienteId.nombre}</p>
                  <p className="text-sm text-gray-700">Tipo: {s.tipoAnimal}</p>
                  <p className="text-sm text-gray-700">Raza: {s.raza}</p>
                  <p className="text-sm text-gray-700">Dimensiones: {s.dimensiones}</p>
                  <p className="text-sm text-gray-700">
                    Vacunas al día: {s.vacunasAlDia ? "Sí" : "No"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => aceptarSolicitud(s._id, s.clienteId._id)}
                      className="text-white bg-petblue px-3 py-1 rounded"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => rechazarSolicitud(s._id, s.clienteId._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Rechazar
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>No hay solicitudes pendientes.</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Solicitudes Aceptadas</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solicitudesAceptadas.length > 0 ? (
              solicitudesAceptadas.map((s: any) => (
                <li key={s._id} className="bg-gray-50 p-4 rounded shadow-sm">
                  <p className="font-medium text-petblue">{s.clienteId.nombre}</p>
                  <p className="text-sm text-gray-700">Tipo: {s.tipoAnimal}</p>
                  <p className="text-sm text-gray-700">Raza: {s.raza}</p>
                  <p className="text-sm text-gray-700">Dimensiones: {s.dimensiones}</p>
                  <p className="text-sm text-gray-700">
                    Vacunas al día: {s.vacunasAlDia ? "Sí" : "No"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/chat/${s.clienteId._id}`)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Chatear
                    </button>
                  </div>
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



  
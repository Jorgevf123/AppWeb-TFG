import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderSecundario from "@/components/HeaderSecundario";

const AreaAcompañante = () => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [solicitudesAceptadas, setSolicitudesAceptadas] = useState([]);

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

  const aceptarSolicitud = async (id: string) => {
    await axios.put(`http://localhost:5000/api/solicitudes/${id}`, { estado: "aceptada" });
    window.location.reload();
  };

  const rechazarSolicitud = async (id: string) => {
    await axios.put(`http://localhost:5000/api/solicitudes/${id}`, { estado: "rechazada" });
    window.location.reload();
  };

  return (
    <>
      <HeaderSecundario />
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
                    onClick={() => aceptarSolicitud(s._id)}
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
                    onClick={() => rechazarSolicitud(s._id)}
                    className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Rechazar
                  </button>
                </li>
              ))
            ) : (
              <li>No hay solicitudes aceptadas.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
};

export default AreaAcompañante;



  
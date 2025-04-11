import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const AreaCliente = () => {
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const madrid: [number, number] = [40.4168, -3.7038];

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    console.log("userId:", userId);
  
    axios.get("/api/matches/acompanantes")
      .then(res => {
        console.log("Acompañantes disponibles:", res.data);
        setAcompanantesDisponibles(res.data);
      })
      .catch(err => {
        console.error("Error al obtener acompañantes:", err);
      });
  
    if (userId) {
      axios.get(`/api/matches/historial/${userId}`)
        .then(res => {
          console.log("Historial:", res.data);
          setHistorial(res.data);
        })
        .catch(err => {
          console.error("Error al cargar historial:", err);
        });
    }
  }, [userId]);
        
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-petblue">Área de Usuario</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Historial de Acompañantes</h2>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
        {Array.isArray(historial) && historial.length > 0 ? (
  historial.map((match: any, idx) => (
    <li key={idx}>{match.acompananteId?.nombre || "Nombre no disponible"}</li>
  ))
) : (
  <li>No hay historial disponible.</li>
)}

        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Acompañantes Disponibles</h2>
        <MapContainer center={madrid} zoom={6} className="h-64 w-full rounded shadow mb-4">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Array.isArray(acompanantesDisponibles) && acompanantesDisponibles.map((a: any, idx) => (

            <Marker key={idx} position={[40.4 + idx * 0.01, -3.7 + idx * 0.01]}>
              <Popup>{a.nombre}</Popup>
            </Marker>
          ))}
        </MapContainer>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
        {Array.isArray(acompanantesDisponibles) && acompanantesDisponibles.map((a: any, idx) => (
            <li key={idx}>
              {a.nombre} <button onClick={() => solicitarAcompanante(a._id)} className="ml-4 bg-petblue text-white px-2 py-1 rounded">Solicitar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const solicitarAcompanante = async (acompananteId: string) => {
  const clienteId = localStorage.getItem("userId");
  if (!clienteId) return;

  try {
    await axios.post("/api/matches", { clienteId, acompananteId });
    alert("Solicitud enviada");
  } catch (err) {
    console.error(err);
    alert("Error al enviar solicitud");
  }
};


export default AreaCliente;




  
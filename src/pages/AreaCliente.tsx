import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";

//import icon from "leaflet/dist/images/marker-icon.png";

// Configurar íconos por defecto (necesario en Vite + React)
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});



const AreaCliente = () => {
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [ubicacionCliente, setUbicacionCliente] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUbicacionCliente(coords);

        try {
          const res = await axios.get(`/api/matches/acompanantes-cercanos?lat=${coords[0]}&lng=${coords[1]}`);
          console.log("Acompañantes visibles en mapa:", res.data);
          setAcompanantesDisponibles(res.data);
        } catch (err) {
          console.error("Error al obtener acompañantes cercanos:", err);
        }
      },
      (error) => {
        console.error("No se pudo obtener la ubicación del cliente:", error);
        setUbicacionCliente([40.4168, -3.7038]); // fallback Madrid
      }
    );

    if (userId && userId !== "undefined") {
      axios.get(`/api/matches/historial/${userId}`)
        .then(res => {
          console.log("Historial:", res.data);
          setHistorial(res.data);
        })
        .catch(err => {
          console.error("Error al cargar historial:", err);
        });
    } else {
      console.warn("No se encontró userId en localStorage");
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
        {ubicacionCliente && (
          <MapContainer
            center={ubicacionCliente}
            zoom={12}
            className="h-64 w-full rounded shadow mb-4"
            whenReady={() => {
              if (mapRef.current) mapRef.current.invalidateSize();
            }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarcadoresConSpiderfier acompanantes={acompanantesDisponibles} />
          </MapContainer>
        )}

        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          {Array.isArray(acompanantesDisponibles) && acompanantesDisponibles.map((a: any, idx) => (
            <li key={idx}>
              {a.nombre}
              <button
                onClick={() => solicitarAcompanante(a._id)}
                className="ml-4 bg-petblue text-white px-2 py-1 rounded"
              >
                Solicitar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

// ✅ Componente para mostrar marcadores con spiderfier
const MarcadoresConSpiderfier = ({ acompanantes }: { acompanantes: any[] }) => {
  const map = useMap();

  useEffect(() => {
    acompanantes.forEach((a) => {
      if (a.ubicacion?.lat && a.ubicacion?.lng) {
        const marker = L.marker([a.ubicacion.lat, a.ubicacion.lng]);
        marker.bindPopup(`<strong>${a.nombre}</strong><br>${a.email}`);
        marker.addTo(map);
        console.log(`Marcador añadido: ${a.nombre}`, a.ubicacion);
      }
    });
  }, [acompanantes, map]);

  return null;
};



// ✅ Solicitud a acompañante
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









  
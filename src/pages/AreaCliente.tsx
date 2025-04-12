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

// Configurar íconos por defecto
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
  const [mensaje, setMensaje] = useState<string | null>(null);
  const mapRef = useRef<L.Map>(null);
  const userId = localStorage.getItem("userId");

  // ✅ Función para solicitar acompañante desde el popup
  const solicitarDesdePopup = async (id: string) => {
    const clienteId = localStorage.getItem("userId");
    if (!clienteId) return;

    try {
      await axios.post("/api/matches", { clienteId, acompananteId: id });
      const nombre = document.querySelector(`button[data-id="${id}"]`)?.closest("div")?.querySelector("strong")?.textContent;
      const texto = nombre ? `Has solicitado a ${nombre}.` : "Solicitud enviada correctamente.";
      setMensaje(texto);
    } catch (err) {
      console.error(err);
      setMensaje("Error al enviar la solicitud.");
    }
  };

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

      {/* ✅ Notificación */}
      {mensaje && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative">
          {mensaje}
          <button
            onClick={() => setMensaje(null)}
            className="absolute top-0 right-0 mt-1 mr-2 text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}

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
            className="h-96 w-full rounded shadow mb-4"
            whenReady={() => {
              if (mapRef.current) mapRef.current.invalidateSize();
            }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarcadoresConPopup
              acompanantes={acompanantesDisponibles}
              onSolicitar={solicitarDesdePopup}
            />
          </MapContainer>
        )}
      </section>
    </div>
  );
};

// ✅ Marcadores con botón Solicitar
const MarcadoresConPopup = ({
  acompanantes,
  onSolicitar
}: {
  acompanantes: any[],
  onSolicitar: (id: string) => void
}) => {
  const map = useMap();

  useEffect(() => {
    acompanantes.forEach((a) => {
      if (a.ubicacion?.lat && a.ubicacion?.lng) {
        const marker = L.marker([a.ubicacion.lat, a.ubicacion.lng]);
        const popupContent = `
          <div style="min-width:180px">
            <strong>${a.nombre}</strong><br/>
            <small>${a.email}</small><br/>
            <small><em>Trayecto:</em> ${a.trayecto || "No definido"}</small><br/>
            <small><em>Valoración:</em> ${a.valoracion || "No disponible"}</small><br/>
            <img 
  src="${a.foto || 'https://placehold.co/150x100'}" 
  alt="foto" 
  style="width:100%; margin-top:5px; border-radius:8px" 
/>

            <button data-id="${a._id}" class="solicitar-btn"
              style="margin-top:8px; background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:4px; width:100%">
              Solicitar
            </button>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.addTo(map);

        // Añadir evento al botón cuando se abre el popup
        marker.on("popupopen", () => {
          setTimeout(() => {
            const boton = document.querySelector(`.solicitar-btn[data-id="${a._id}"]`);
            boton?.addEventListener("click", () => onSolicitar(a._id));
          }, 0);
        });
      }
    });
  }, [acompanantes, map, onSolicitar]);

  return null;
};

export default AreaCliente;










  
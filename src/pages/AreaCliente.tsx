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
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(null);
  const [origenDeseado, setOrigenDeseado] = useState("");
  const [destinoDeseado, setDestinoDeseado] = useState("");
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

  useEffect(() => {
    const clienteId = localStorage.getItem("userId");
    if (!clienteId) return;
  
    axios.get(`http://localhost:5000/api/solicitudes/cliente/${clienteId}`)
      .then(res => {
        const ultima = res.data[res.data.length - 1];
        if (ultima?.estado === "aceptada") {
          setEstadoSolicitud("¡Tu solicitud ha sido aceptada!");
        } else if (ultima?.estado === "rechazada") {
          setEstadoSolicitud("Tu solicitud ha sido rechazada.");
        }
      })
      .catch(err => console.error("Error al obtener estado de la solicitud", err));
  }, []);
  const normalizar = (texto: string) =>
    texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");  
  const filtrados = acompanantesDisponibles.filter((a) => {
    if (!a.viaje?.origen || !a.viaje?.destino) return false;
  
    const origenOk = origenDeseado
      ? normalizar(a.viaje.origen) === normalizar(origenDeseado)
      : true;
  
    const destinoOk = destinoDeseado
      ? normalizar(a.viaje.destino) === normalizar(destinoDeseado)
      : true;
  
    return origenOk && destinoOk;
  });
  console.log("Acompañantes filtrados:", filtrados);
  
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-petblue">Área de Usuario</h1>
      {estadoSolicitud && (
      <div className={`px-4 py-2 rounded text-white font-semibold mb-4 ${
        estadoSolicitud.includes("aceptada") ? "bg-green-500" : "bg-red-500"
      }`}>
        {estadoSolicitud}
      </div>
    )}

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
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Origen deseado"
            value={origenDeseado}
            onChange={(e) => setOrigenDeseado(e.target.value)}
            className="border px-3 py-2 rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Destino deseado"
            value={destinoDeseado}
            onChange={(e) => setDestinoDeseado(e.target.value)}
            className="border px-3 py-2 rounded w-1/2"
          />
        </div>
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
              acompanantes={filtrados}
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
    // Limpiar marcadores anteriores
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
    acompanantes.forEach((a) => {
      if (a.ubicacion?.lat && a.ubicacion?.lng) {
        const marker = L.marker([a.ubicacion.lat, a.ubicacion.lng]);
        const popupContent = `
          <div style="min-width:180px">
            <strong>${a.nombre}</strong><br/>
            <small><em>Tipo:</em> ${a.viaje?.tipo || "No definido"}</small><br/>
            <small><em>Origen:</em> ${a.viaje?.origen || "-"}</small><br/>
            <small><em>Destino:</em> ${a.viaje?.destino || "-"}</small><br/>
            <small><em>Fecha:</em> ${a.viaje?.fecha ? new Date(a.viaje.fecha).toLocaleDateString() : "-"}</small><br/>
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
            boton?.addEventListener("click", () => {
              window.location.href = `/solicitud/${a._id}`;
            });            
          }, 0);
        });
      }
    });
  }, [acompanantes, map, onSolicitar]);

  return null;
};

export default AreaCliente;










  
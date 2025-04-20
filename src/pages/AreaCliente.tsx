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
import HeaderSecundario from "@/components/HeaderSecundario";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { io } from 'socket.io-client';

// Configurar íconos por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
});

const AreaCliente = () => {
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [ubicacionCliente, setUbicacionCliente] = useState<[number, number] | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(() =>
    localStorage.getItem("estadoSolicitud")
  );  
  const [origenDeseado, setOrigenDeseado] = useState("");
  const [destinoDeseado, setDestinoDeseado] = useState("");
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<string[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<string[]>([]);
  const mapRef = useRef<L.Map>(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
 


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
    const clienteId = localStorage.getItem("userId");
    if (!clienteId) return;
  
    axios.get(`http://localhost:5000/api/solicitudes/cliente/${clienteId}`)
      .then(res => {
        const ultima = res.data[0]; // solicitud más reciente
        if (!ultima) return;
  
        const yaNotificada = localStorage.getItem("ultimaNotificada");
        if (yaNotificada === ultima._id) return;
  
        if (ultima.estado === "aceptada" || ultima.estado === "rechazada") {
          const mensaje = ultima.estado === "aceptada"
            ? "¡Tu solicitud ha sido aceptada!"
            : "Tu solicitud ha sido rechazada.";
  
          localStorage.setItem("estadoSolicitud", mensaje);
          localStorage.setItem("notificacionMostrada", "false"); // activa punto rojo
          localStorage.setItem("ultimaNotificada", ultima._id);
  
          toast.success(mensaje); // muestra toast
        }
      })
      .catch(err =>
        console.error("Error al obtener estado de la solicitud", err)
      );
  }, []);
  
  

     

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUbicacionCliente(coords);
  
        const userId = localStorage.getItem("userId");
        if (userId && userId !== "undefined") {
          try {
            // ✅ ACTUALIZA la ubicación real del cliente en la base de datos
            await axios.put(`http://localhost:5000/api/users/ubicacion/${userId}`, {
              lat: coords[0],
              lng: coords[1],
            });
            console.log("Ubicación del cliente actualizada.");
          } catch (err) {
            console.error("Error al actualizar ubicación del cliente:", err);
          }
  
          try {
            // ✅ Llama a los acompañantes cercanos en base a la ubicación real
            const res = await axios.get(
              `/api/matches/acompanantes-cercanos?lat=${coords[0]}&lng=${coords[1]}`
            );
            console.log("Acompañantes visibles en mapa:", res.data);
            setAcompanantesDisponibles(res.data);
          } catch (err) {
            console.error("Error al obtener acompañantes cercanos:", err);
          }
  
          try {
            // ✅ Lógica existente: historial
            const historialRes = await axios.get(`/api/matches/historial/${userId}`);
            setHistorial(historialRes.data);
          } catch (err) {
            console.error("Error al cargar historial:", err);
          }
        } else {
          console.warn("No se encontró userId en localStorage");
        }
      },
      (error) => {
        console.error("No se pudo obtener la ubicación del cliente:", error);
        setUbicacionCliente([40.4168, -3.7038]); // fallback Madrid
      }
    );
  }, [userId]);  
  
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
  
    // ✅ Informamos al backend que el cliente está online
    socket.emit("usuarioOnline", userId);

  
    // ✅ Al desconectarse, se avisa al backend también
    window.addEventListener("beforeunload", () => {
      socket.emit("usuarioOffline", userId);
    });
  
    // ✅ Limpieza por si cambia de vista o recarga sin cerrar
    return () => {
      socket.emit("usuarioOffline", userId);
      socket.disconnect();
    };
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
  const buscarUbicaciones = async (termino: string) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(termino)}&lang=es&limit=5&type=city&filter=countrycode:es&apiKey=a0dff030ee394fffac232047610c8478`
      );
      const data = await res.json();
      return data.features.map((item: any) => item.properties.city);
    } catch (err) {
      console.error("Error al buscar ubicaciones:", err);
      return [];
    }
  };  
  
  
  const handleOrigenChange = async (valor: string) => {
    setOrigenDeseado(valor);
    if (valor.length >= 3) {
      const resultados = await buscarUbicaciones(valor);
      setSugerenciasOrigen(resultados);
    } else {
      setSugerenciasOrigen([]);
    }
  };
  
  const handleDestinoChange = async (valor: string) => {
    setDestinoDeseado(valor);
    if (valor.length >= 3) {
      const resultados = await buscarUbicaciones(valor);
      setSugerenciasDestino(resultados);
    } else {
      setSugerenciasDestino([]);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-petblue">Área de Cliente</h1>
  
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
                <li key={idx}>{match.acompananteId?.nombre || "Nombre no disponible"}
                <button
                  onClick={() => navigate(`/chat/${match.acompananteId?._id}`)}
                  className="ml-4 bg-green-500 text-white px-2 py-1 rounded"
                >
                  Chatear
                </button>
                </li>
              ))
            ) : (
              <li>No hay historial disponible.</li>
            )}
          </ul>
        </section>
  
        <section>
          <h2 className="text-xl font-semibold mb-2">Acompañantes Disponibles</h2>
          <div className="mb-6 flex gap-4 relative">
            <div className="w-1/2 relative">
              <input
                type="text"
                placeholder="Origen deseado"
                value={origenDeseado}
                onChange={(e) => handleOrigenChange(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
              {sugerenciasOrigen.length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full z-50 max-h-40 overflow-y-auto rounded shadow">
                  {sugerenciasOrigen.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setOrigenDeseado(s);
                        setSugerenciasOrigen([]);
                      }}
                      className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
  
            <div className="w-1/2 relative">
              <input
                type="text"
                placeholder="Destino deseado"
                value={destinoDeseado}
                onChange={(e) => handleDestinoChange(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full z-50 max-h-40 overflow-y-auto rounded shadow">
                  {sugerenciasDestino.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setDestinoDeseado(s);
                        setSugerenciasDestino([]);
                      }}
                      className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
  
          {ubicacionCliente && (
            <MapContainer
              center={ubicacionCliente}
              zoom={12}
              className="h-96 w-full rounded shadow mb-4 mt-40"
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
      <Footer />
    </>
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
  const lineaRef = useRef<L.Polyline | null>(null);
  const limpiarTexto = (texto: string): string => {
    // Devuelve solo la primera parte antes de la coma
    return texto.split(",")[0].trim();
  };  
  const obtenerCoordenadas = async (lugar: string): Promise<[number, number] | null> => {
    try {
      const lugarLimpiado = limpiarTexto(lugar);
      const res = await fetch(`http://localhost:5000/api/nominatim/coordenadas?lugar=${encodeURIComponent(lugarLimpiado)}`);
      if (!res.ok) throw new Error("Error al obtener coordenadas");
      const data = await res.json();
      return [parseFloat(data.lat), parseFloat(data.lon)];
    } catch (err) {
      console.error("Error al obtener coordenadas:", err);
      return null;
    }
  };   
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
        marker.on("popupopen", async () => {
          setTimeout(() => {
            const boton = document.querySelector(`.solicitar-btn[data-id="${a._id}"]`);
            boton?.addEventListener("click", () => {
              window.location.href = `/solicitud/${a._id}`;
            });
          }, 0);
        
          // Eliminar línea anterior si existe
          if (lineaRef.current) {
            map.removeLayer(lineaRef.current);
            lineaRef.current = null;
          }
        
          // Obtener coordenadas de origen y destino
          const origen = await obtenerCoordenadas(a.viaje?.origen || "");
          const destino = await obtenerCoordenadas(a.viaje?.destino || "");
        
          if (origen && destino) {
            const linea = L.polyline([origen, destino], { color: "blue", weight: 3 }).addTo(map);
            lineaRef.current = linea;
            map.fitBounds([origen, destino], { padding: [50, 50] });
          }
        });
        
      }
    });
  }, [acompanantes, map, onSolicitar]);

  return null;
};

export default AreaCliente;










  
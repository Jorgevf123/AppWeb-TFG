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
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { io } from 'socket.io-client';
import { FaStar, FaRegStar } from "react-icons/fa";


// Configurar íconos por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const socket = io(
  window.location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "http://18.214.63.24:5000",
  { transports: ["websocket"] }
);
const baseUrl = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "http://18.214.63.24:5000";


const AreaCliente = () => {
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [ubicacionCliente, setUbicacionCliente] = useState<[number, number] | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(null);

useEffect(() => {
  const estado = localStorage.getItem("estadoSolicitud");
  setEstadoSolicitud(estado);
}, []);
  
  const [destinoDeseado, setDestinoDeseado] = useState("");
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<string[]>([]);
  const mapRef = useRef<L.Map>(null);
  const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  setUserId(localStorage.getItem("userId"));
}, []);
  const navigate = useNavigate();
  const [mostrarModalValoracion, setMostrarModalValoracion] = useState(false);
  const [matchAValorar, setMatchAValorar] = useState<string | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [reporteTexto, setReporteTexto] = useState("");
  const [acompananteReportadoId, setAcompananteReportadoId] = useState<string | null>(null);
  const [acompananteReportadoNombre, setAcompananteReportadoNombre] = useState<string | null>(null);

  const abrirModalReporte = (id: string, nombre: string) => {
    setAcompananteReportadoId(id);
    setAcompananteReportadoNombre(nombre);
    setReporteTexto("");
    setMostrarModalReporte(true);
  };
  
  const enviarReporte = async () => {
    if (!acompananteReportadoId || !reporteTexto.trim()) return;
  
    try {
      await axios.post(`${baseUrl}/api/reportes`, {
        remitente: userId,
        destinatario: acompananteReportadoId,
        motivo: reporteTexto
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
  
      toast.success("Reporte enviado correctamente.");
      setMostrarModalReporte(false);
    } catch (err) {
      console.error("Error al enviar reporte:", err);
      toast.error("Error al enviar el reporte.");
    }
  };  

  const solicitarDesdePopup = async (id: string) => {
    const clienteId = localStorage.getItem("userId");
    if (!clienteId) return;
  
    try {
      await axios.post(`${baseUrl}/api/solicitudes`, {
        acompananteId: id,
        tipoAnimal: "perro", // 🔥 puedes poner un valor por defecto o pedirlo en un modal
        raza: "no especificada",
        dimensiones: "no especificado",
        vacunasAlDia: true
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // 🔥 porque tu endpoint POST /solicitudes usa auth
        }
      });
  
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
  
    axios.get(`${baseUrl}/api/solicitudes/cliente/${clienteId}`)
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
  if (window.isSecureContext || window.location.hostname === "localhost") {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUbicacionCliente(coords);

        const userId = localStorage.getItem("userId");
        if (userId && userId !== "undefined") {
          try {
            await axios.put(`${baseUrl}/api/users/ubicacion/${userId}`, {
              lat: coords[0],
              lng: coords[1],
            });
            console.log("Ubicación del cliente actualizada.");
          } catch (err) {
            console.error("Error al actualizar ubicación del cliente:", err);
          }

          try {
            const res = await axios.get(
              `${baseUrl}/api/matches/acompanantes-cercanos?lat=${coords[0]}&lng=${coords[1]}`
            );
            setAcompanantesDisponibles(res.data);
          } catch (err) {
            console.error("Error al obtener acompañantes cercanos:", err);
          }

          try {
            const historialRes = await axios.get(`${baseUrl}/api/matches/historial/${userId}`);
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
        setUbicacionCliente([40.4168, -3.7038]); // fallback
      }
    );
  } else {
    console.warn("⚠️ Geolocalización solo permitida en orígenes seguros");
    setUbicacionCliente([40.4168, -3.7038]);
  }
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
  const viajesFiltrados = Array.isArray(acompanantesDisponibles)
  ? acompanantesDisponibles.flatMap((acompanante) => {
    if (!Array.isArray(acompanante.viajes)) return [];
  
    return acompanante.viajes
      .filter((viaje: any) => {
        const destinoOk = destinoDeseado
          ? normalizar(viaje.destino) === normalizar(destinoDeseado)
          : true;
  
        const precioOk = precioMax !== null
          ? viaje.precio !== undefined && viaje.precio <= precioMax
          : true;
  
        return destinoOk && precioOk;
      })
      .map((viaje: any) => ({
        viaje,
        acompanante
      }));
  }): [];    
    
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
  
  const handleDestinoChange = async (valor: string) => {
    setDestinoDeseado(valor);
    if (valor.length >= 3) {
      const resultados = await buscarUbicaciones(valor);
      setSugerenciasDestino(resultados);
    } else {
      setSugerenciasDestino([]);
    }
  };
  
  const abrirModalValoracion = (matchId: string) => {
    setEstrellas(0);
    setComentario("");
    setMatchAValorar(matchId);
    setTimeout(() => {
      setMostrarModalValoracion(true);
    }, 50); // Un pequeño retardo asegura que React haya reseteado estrellas a 0
  };  
  
  
  const enviarValoracion = async () => {
    if (!matchAValorar) return;
  
    try {
      await axios.put(`${baseUrl}/api/matches/valorar/${matchAValorar}`, {
        valoracionCliente: estrellas,
        comentarioCliente: comentario,
      });
      await axios.put(`${baseUrl}/api/solicitudes/actualizar-valoracion/${matchAValorar}`, {
      valoracionPendiente: false,
      });
  
      toast.success("¡Gracias por tu valoración!");
      setMostrarModalValoracion(false);
      window.location.reload();
    } catch (err) {
      console.error("Error al enviar valoración", err);
      alert("Error al enviar valoración.");
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
              <li key={idx} className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span>{match.acompananteId?.nombre || "Nombre no disponible"}</span>
                  <button
                    onClick={() => abrirModalReporte(match.acompananteId?._id, match.acompananteId?.nombre || "Acompañante")}
                    className="text-red-600 text-xl"
                    title="Reportar acompañante"
                  >
                    🚩
                  </button>
                  <button
                    onClick={() => navigate(`/chat/${match.acompananteId?._id}`)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Chatear
                  </button>

                  {match.matchId?.finalizado || match?.valoracionPendiente ? (
                    <button
                      onClick={() => abrirModalValoracion(match.matchId._id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Valorar
                    </button>
                  ) : null}
                </div>
              </li>
            ))
          ) : (
            <li>No hay historial disponible.</li>
          )}

          </ul>
        </section>
  
        <section>
          <h2 className="text-xl font-semibold mb-2">Acompañantes Disponibles</h2>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 relative">
              <input
                type="text"
                placeholder="Destino deseado"
                value={destinoDeseado}
                onChange={(e) => handleDestinoChange(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full z-50 max-h-40 overflow-y-auto rounded shadow">
                  {Array.isArray(sugerenciasDestino) && sugerenciasDestino.map((s, i) => (
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

            <div className="w-full md:w-1/2">
              <input
                type="number"
                placeholder="Precio máximo (€)"
                value={precioMax ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setPrecioMax(value === "" ? null : parseInt(value));
                }}
                className="border px-3 py-2 rounded w-full"
              />
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
                viajes={viajesFiltrados}
                onSolicitar={solicitarDesdePopup}
              />
            </MapContainer>
          )}
        </section>
      </div>
      {mostrarModalValoracion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg space-y-4 w-80">
            <h2 className="text-xl font-bold text-center">Valorar Acompañante</h2>
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5].map(num => (
                <span key={num} onClick={() => setEstrellas(num)} className="cursor-pointer text-3xl">
                  {num <= estrellas ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-400" />
                  )}
                </span>
              ))}
            </div>
            <textarea
              placeholder="Comentario (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full border rounded p-2"
            ></textarea>

            <button
              onClick={enviarValoracion}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Enviar Valoración
            </button>

            <button
              onClick={() => setMostrarModalValoracion(false)}
              className="w-full bg-gray-300 text-gray-700 py-1 rounded text-sm mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {mostrarModalReporte && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded shadow-lg space-y-4 w-96">
    <h2 className="text-xl font-bold text-center">
      Reportar a {acompananteReportadoNombre || "Acompañante"}
    </h2>
      <textarea
        placeholder="Escribe el motivo del reporte..."
        value={reporteTexto}
        onChange={(e) => setReporteTexto(e.target.value)}
        className="w-full border rounded p-2 min-h-[100px]"
      ></textarea>
      <button
        onClick={enviarReporte}
        className="w-full bg-red-500 text-white py-2 rounded"
      >
        Enviar Reporte
      </button>
      <button
        onClick={() => setMostrarModalReporte(false)}
        className="w-full bg-gray-300 text-gray-700 py-1 rounded text-sm mt-2"
      >
        Cancelar
      </button>
    </div>
  </div>
)}
      <Footer />
    </>
  );  
};


// ✅ Marcadores con botón Solicitar
const MarcadoresConPopup = ({
  viajes,
  onSolicitar
}: {
  viajes: { viaje: any; acompanante: any }[],
  onSolicitar: (id: string) => void
}) => {
  const map = useMap();
  const lineaRef = useRef<L.Polyline | null>(null);

  const limpiarTexto = (texto: string): string => {
    return texto.split(",")[0].trim();
  };

  const obtenerCoordenadas = async (lugar: string): Promise<[number, number] | null> => {
    try {
      const lugarLimpiado = limpiarTexto(lugar);
      const res = await fetch(`${baseUrl}/api/nominatim/coordenadas?lugar=${encodeURIComponent(lugarLimpiado)}`);
      if (!res.ok) throw new Error("Error al obtener coordenadas");
      const data = await res.json();
      return [parseFloat(data.lat), parseFloat(data.lon)];
    } catch (err) {
      console.error("Error al obtener coordenadas:", err);
      return null;
    }
  };

  const markerSeleccionado = useRef<L.Marker | null>(null);

useEffect(() => {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  Array.isArray(viajes) && viajes.forEach(({ viaje, acompanante }, index) => {
    if (viaje.origen && viaje.destino && acompanante.ubicacion) {
      const offsetLat = 0.0005 * index;
      const offsetLng = 0.0005 * index;

      const marker = L.marker([
        acompanante.ubicacion.lat + offsetLat,
        acompanante.ubicacion.lng + offsetLng
      ]);

      const popupContent = `
        <div style="min-width:220px; padding: 10px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px">
            <img src="${acompanante.imagenPerfil || 'https://placehold.co/40x40'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover"/>
            <strong style="font-size:16px">${acompanante.nombre}</strong>
            <div style="display:flex; align-items:center; gap:4px; margin-top:4px; flex-wrap: wrap;">
              ${acompanante.mediaValoracion !== null 
                ? `<span style="color:#facc15; font-size:18px;">${"⭐".repeat(Math.round(acompanante.mediaValoracion))}</span><small style="font-size: 14px;"> (${acompanante.mediaValoracion})</small>`
                : `<small>Sin valoraciones</small>`}
            </div>
          </div>
          <small><em>Tipo:</em> ${viaje.tipo || "No definido"}</small><br/>
          <small><em>Origen:</em> ${viaje.origen || "-"}</small><br/>
          <small><em>Destino:</em> ${viaje.destino || "-"}</small><br/>
          <small><em>Fecha:</em> ${viaje.fecha ? new Date(viaje.fecha).toLocaleDateString() : "-"}</small><br/>
          <small><em>Precio:</em> ${typeof viaje.precio !== "undefined" ? viaje.precio + "€" : "No indicado"}</small><br/>
          <button data-id="${acompanante._id}" class="solicitar-btn"
            style="margin-top:8px; background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:4px; width:100%">
            Solicitar
          </button>
        </div>
      `;



      marker.bindPopup(popupContent);
      marker.addTo(map);
      marker.on("popupopen", () => {
        setTimeout(() => {
          const boton = document.querySelector(`.solicitar-btn[data-id="${acompanante._id}"]`);
          boton?.addEventListener("click", () => {
            window.location.href = `/solicitud/${acompanante._id}`;
          });
        }, 0);
      });
      
      

      // 🔵 Mostrar info SOLO pasando el ratón (sin dibujar línea)
      marker.on("mouseover", () => {
        if (!marker.isPopupOpen()) {
          marker.openPopup();
        }
      });

      marker.on("mouseout", () => {
        if (!markerSeleccionado.current) {
          marker.closePopup(); // Solo si NO hay marcador clicado
        }
      });

      // 🔥 Click en marcador: línea + control de apertura/cierre
marker.on("click", async (e) => {
  e.originalEvent.stopPropagation(); // evitar conflicto con click en mapa

  if (markerSeleccionado.current === marker) {
    // 🔵 Si clicas otra vez el mismo ➔ cerrar popup y borrar línea
    marker.closePopup();
    if (lineaRef.current) {
      map.removeLayer(lineaRef.current);
      lineaRef.current = null;
    }
    markerSeleccionado.current = null;
    return;
  }

  // 🔵 Si había otra línea ➔ la quitamos
  if (lineaRef.current) {
    map.removeLayer(lineaRef.current);
    lineaRef.current = null;
  }

  // 🔵 Seleccionamos este marcador
  markerSeleccionado.current = marker;

  const origenCoords = await obtenerCoordenadas(viaje.origen);
  const destinoCoords = await obtenerCoordenadas(viaje.destino);

  if (!origenCoords || !destinoCoords) return;

  try {
    const res = await fetch(
      `${baseUrl}/api/openrouteservice/ruta?origenLat=${origenCoords[0]}&origenLng=${origenCoords[1]}&destinoLat=${destinoCoords[0]}&destinoLng=${destinoCoords[1]}`
    );       
    const data = await res.json();

    if (data && data.features?.[0]) {
      const coordinates = data.features[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      const ruta = L.polyline(coordinates, { color: "blue", weight: 3 }).addTo(map);
      lineaRef.current = ruta;
      map.fitBounds(ruta.getBounds(), { padding: [50, 50] });
    } else {
      console.warn("No se pudo obtener la ruta desde OpenRouteService");
    }
  } catch (err) {
    console.error("Error al obtener ruta desde OpenRouteService:", err);
  }
  marker.openPopup();
});


      // 🔥 Cuando se cierra el popup por cualquier otra causa
      marker.on("popupclose", () => {
        if (!markerSeleccionado.current) {
          if (lineaRef.current) {
            map.removeLayer(lineaRef.current);
            lineaRef.current = null;
          }
        }
      });
    }
  });

  // 🔥 Click en el mapa vacío: quitar todo
  map.on("click", () => {
    if (lineaRef.current) {
      map.removeLayer(lineaRef.current);
      lineaRef.current = null;
    }
    if (markerSeleccionado.current) {
      markerSeleccionado.current.closePopup();
      markerSeleccionado.current = null;
    }
  });

}, [viajes, map, onSolicitar]);


  return null;
};

export default AreaCliente;
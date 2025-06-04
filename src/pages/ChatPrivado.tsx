import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Footer from "@/components/Footer";
import axios from "axios";
import Navbar from "@/components/Navbar";
import api from "@/utils/api"
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//const socket = io(BASE_URL.replace(/^http/, "ws"), { transports: ["websocket"] });

const obtenerMatchId = async (currentUserId: string, userId: string) => {
  try {
    const res = await api.get(`/api/matches/entre/${currentUserId}/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data.matchId;
  } catch (err) {
    console.error("Error obteniendo matchId:", err);
    return null;
  }
};
const ChatPrivado = () => {
  const { userId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const socketRef = useRef<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [receptor, setReceptor] = useState<string>("Usuario");
  const chatRef = useRef<HTMLDivElement>(null);
  const [mensajesNuevos, setMensajesNuevos] = useState<number[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
  if (!userId || !currentUserId) return;

  const cargarChat = async () => {
    const matchId = await obtenerMatchId(currentUserId, userId);
    if (!matchId) {
      toast.error("No se ha cargado correctamente la conversación.");
      return;
    }

    socketRef.current = io(BASE_URL.replace(/^http/, "ws"), { transports: ["websocket"] });

    const room = [currentUserId, userId].sort().join("-");
    console.log("✅ Uniéndose a sala:", room);
    socketRef.current.emit("unirseSala", { usuario1: currentUserId, usuario2: userId });
    //socketRef.current.join(room);

    api.get(`/api/chat/${matchId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => {
        setMensajes(res.data?.mensajes || []);
        setReceptor(res.data.nombreReceptor || "Usuario");
      })
      .catch((err) => console.error("Error cargando mensajes:", err));
  };

  cargarChat();

  return () => {
    socketRef.current?.disconnect(); 
  };
}, [userId]);

  useEffect(() => {
  if (!currentUserId) return;
  const socket = socketRef.current;
  socket?.emit("usuarioOnline", currentUserId);

  const handleBeforeUnload = () => {
    socket?.emit("usuarioOffline", currentUserId);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    socket?.emit("usuarioOffline", currentUserId);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [currentUserId]);

  useEffect(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  const handleMensaje = (nuevoMensaje: any) => {
    const nuevoId = Date.now();
    setMensajes((prev) => [...prev, { ...nuevoMensaje, _tempId: nuevoId }]);
    setMensajesNuevos((prev) => [...prev, nuevoId]);

    setTimeout(() => {
      setMensajesNuevos((prev) => prev.filter((id) => id !== nuevoId));
    }, 2500);
  };

  socket.on("mensajeRecibido", handleMensaje);

  return () => {
    socket.off("mensajeRecibido", handleMensaje);
  };
}, []);



  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [mensajes]);

  useEffect(() => {
    return () => {
      socketRef.current?.emit("usuarioOffline", currentUserId);
      socketRef.current?.disconnect();
    };
  }, []);

  const enviarMensaje = async () => {
  if (!mensaje.trim() && !archivo) return;

  const formData = new FormData();
  formData.append("texto", mensaje);
  formData.append("receptorId", userId!);
  if (archivo) formData.append("archivo", archivo);

  try {
    const matchId = await obtenerMatchId(currentUserId, userId);
    if (!matchId) return;

    const res = await api.post(`/api/chat/${matchId}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data"
      }
    });

    const mensajeConId = {
      ...res.data.mensaje,
      remitente: currentUserId,
      _tempId: Date.now()
    };

    setMensajes(prev => [...prev, mensajeConId]);

    setMensajesNuevos(prev => [...prev, mensajeConId._tempId]);
    setTimeout(() => {
      setMensajesNuevos(prev => prev.filter(id => id !== mensajeConId._tempId));
    }, 2500);

    socketRef.current?.emit("enviarMensaje", {
      ...res.data.mensaje,
      remitente: currentUserId,
      para: userId
    });

    setMensaje("");
    setArchivo(null);
    if ((window as any).archivoInput) {
      (window as any).archivoInput.value = "";
    }

  } catch (err: any) {
    console.error("Error enviando mensaje:", err);
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.error;
      if (msg?.includes("tamaño máximo")) {
        toast.error("El archivo es demasiado grande (máx 5MB).");
        return;
      }
    }

    toast.error("No se pudo enviar el mensaje.");
  }
};

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-petblue">Chat con {receptor}</h2>
        <div
          ref={chatRef}
          className="h-80 overflow-y-auto border p-4 mb-4 rounded bg-gray-50"
        >
          {Array.isArray(mensajes) && mensajes.map((msg, i) => {
            const isNuevo = mensajesNuevos.includes(msg._tempId);
            const remitenteId = typeof msg.remitente === "string" ? msg.remitente : msg.remitente?._id;
            const esActual = remitenteId === currentUserId;
            return (
              <div
                key={i}
                className={`mb-2 p-2 rounded max-w-xs ${
                  esActual
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-black mr-auto"
                } ${isNuevo ? "animate-bounce" : ""}`}
              >
                <p className="font-semibold text-sm">
                  {esActual ? "Tú" : receptor}
                  {isNuevo && !esActual && (
                    <span className="ml-2 text-xs bg-green-300 text-green-800 px-2 py-0.5 rounded-full">Nuevo</span>
                  )}
                </p>
                <p>{msg.texto}</p>

                {msg.archivo && (
                  msg.archivo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={`${BASE_URL}/uploads/${msg.archivo}`}
                      alt="adjunto"
                      className="mt-2 max-w-[150px] rounded"
                    />
                  ) : (
                    <a
                      href={`${BASE_URL}/uploads/${msg.archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-sm underline"
                    >
                      Ver archivo adjunto
                    </a>
                  )
                )}

                <small className="block text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            );
          })}
        </div>

        <div className="mb-3">
          <label className="inline-block cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-1 px-3 rounded">
            Seleccionar archivo
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              capture
              onChange={(e) => {
                setArchivo(e.target.files?.[0] || null);
              }}
              ref={(ref) => {
                (window as any).archivoInput = ref;
              }}
              className="hidden"
            />
          </label>

          {archivo && (
            <div className="text-sm flex items-center gap-2 mt-2">
              <span>{archivo.name}</span>
              <button
                onClick={() => {
                  setArchivo(null);
                  if ((window as any).archivoInput) {
                    (window as any).archivoInput.value = "";
                  }
                }}
                className="text-red-600 text-xs font-bold hover:underline"
              >
                ❌ Quitar
              </button>
            </div>
          )}
        </div>



        <div className="flex">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="flex-grow border px-3 py-2 rounded-l"
            placeholder="Escribe tu mensaje..."
          />
          <button
            onClick={enviarMensaje}
            className="bg-petblue text-white px-4 py-2 rounded-r"
          >
            Enviar
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPrivado;



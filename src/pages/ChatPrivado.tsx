import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import HeaderSecundario from "@/components/HeaderSecundario";
import Footer from "@/components/Footer";
import axios from "axios";
import Navbar from "@/components/Navbar";

const socket = io("http://localhost:5000");

const ChatPrivado = () => {
  const { userId } = useParams(); // ID del receptor
  const currentUserId = localStorage.getItem("userId");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [receptor, setReceptor] = useState<string>("Usuario");
  const chatRef = useRef<HTMLDivElement>(null);
  const [mensajesNuevos, setMensajesNuevos] = useState<number[]>([]);

  useEffect(() => {
    if (!userId || !currentUserId) return;

    socket.emit("unirseSala", {
      usuario1: currentUserId,
      usuario2: userId
    });

    axios
      .get(`http://localhost:5000/api/chat/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then((res) => {
        setMensajes(res.data?.mensajes || []);
        setReceptor(res.data.nombreReceptor || "Usuario");
      })
      .catch((err) => console.error("Error cargando mensajes:", err));
  }, [userId]);

  useEffect(() => {
    const listener = (nuevoMensaje: any) => {
      const nuevoId = Date.now();
      setMensajes((prev) => [...prev, { ...nuevoMensaje, _tempId: nuevoId }]);
      setMensajesNuevos((prev) => [...prev, nuevoId]);
  
      setTimeout(() => {
        setMensajesNuevos((prev) => prev.filter((id) => id !== nuevoId));
      }, 2500);
    };
  
    socket.on("mensajeRecibido", listener);
  
    return () => {
      socket.off("mensajeRecibido", listener);
    };
  }, []);
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [mensajes]);

  const enviarMensaje = () => {
    if (!mensaje.trim()) return;
  
    socket.emit("enviarMensaje", {
      para: userId,
      de: currentUserId,
      texto: mensaje
    });
  
    axios.post(
      `http://localhost:5000/api/chat/${userId}`,
      { texto: mensaje },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
  
    setMensaje("");
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
          {mensajes.map((msg, i) => {
            const isNuevo = mensajesNuevos.includes(msg._tempId);
            const esActual = msg.remitente?._id === currentUserId || msg.remitente === currentUserId;

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
                <small className="block text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            );
          })}
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


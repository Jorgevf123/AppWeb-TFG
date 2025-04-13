import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FormularioViaje: React.FC = () => {
  const { tipo } = useParams<{ tipo: string }>(); // 'avion' o 'tren'
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) return setMensaje("Usuario no autenticado.");

    try {
        await axios.put(`http://localhost:5000/api/users/${userId}/viaje`, {
            tipo,
            origen,
            destino,
            fecha,
          });
      setMensaje("¡Viaje guardado con éxito!");
      setTimeout(() => navigate("/area-acompanante"), 1500); // Redirige tras guardar
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar el viaje.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-petblue">Registrar viaje en {tipo === "avion" ? "avión" : "tren"}</h1>

      {mensaje && <p className="text-sm text-center text-green-600">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Origen</label>
          <input
            type="text"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Ej. Madrid"
          />
        </div>
        <div>
          <label className="block font-medium">Destino</label>
          <input
            type="text"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Ej. Barcelona"
          />
        </div>
        <div>
          <label className="block font-medium">Fecha del viaje</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-petblue text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Guardar viaje
        </button>
      </form>
    </div>
  );
};

export default FormularioViaje;

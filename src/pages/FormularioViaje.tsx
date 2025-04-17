import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderPrivado from "@/components/HeaderSecundario";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FormularioViaje: React.FC = () => {
  const { tipo } = useParams<{ tipo: string }>(); // 'avion' o 'tren'
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<string[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<string[]>([]);
  const navigate = useNavigate();

  const buscarUbicaciones = async (termino: string) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          termino
        )}&lang=es&limit=5&type=city&filter=countrycode:es&apiKey=a0dff030ee394fffac232047610c8478`
      );
      const data = await res.json();
      return data.features.map((item: any) => item.properties.city);
    } catch (err) {
      console.error("Error al buscar ubicaciones:", err);
      return [];
    }
  };

  const handleOrigenChange = async (valor: string) => {
    setOrigen(valor);
    if (valor.length >= 3) {
      const resultados = await buscarUbicaciones(valor);
      setSugerenciasOrigen(resultados);
    } else {
      setSugerenciasOrigen([]);
    }
  };

  const handleDestinoChange = async (valor: string) => {
    setDestino(valor);
    if (valor.length >= 3) {
      const resultados = await buscarUbicaciones(valor);
      setSugerenciasDestino(resultados);
    } else {
      setSugerenciasDestino([]);
    }
  };

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
      setTimeout(() => navigate("/area-acompanante"), 1500);
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar el viaje.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-petblue">
          Registrar viaje en {tipo === "avion" ? "avión" : "tren"}
        </h1>

        {mensaje && (
          <p className="text-sm text-center text-green-600">{mensaje}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block font-medium">Origen</label>
            <input
              type="text"
              value={origen}
              onChange={(e) => handleOrigenChange(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
              placeholder="Ej. Madrid"
            />
            {sugerenciasOrigen.length > 0 && (
              <ul className="absolute bg-white border mt-1 w-full z-50 max-h-40 overflow-y-auto rounded shadow">
                {sugerenciasOrigen.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setOrigen(s);
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

          <div className="relative">
            <label className="block font-medium">Destino</label>
            <input
              type="text"
              value={destino}
              onChange={(e) => handleDestinoChange(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
              placeholder="Ej. Barcelona"
            />
            {sugerenciasDestino.length > 0 && (
              <ul className="absolute bg-white border mt-1 w-full z-50 max-h-40 overflow-y-auto rounded shadow">
                {sugerenciasDestino.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setDestino(s);
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
      <Footer />
    </>
  );
};

export default FormularioViaje;



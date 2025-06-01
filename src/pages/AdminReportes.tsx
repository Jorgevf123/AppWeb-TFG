import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import api from "@/utils/api";

const AdminReportes = () => {
  const [reportes, setReportes] = useState([]);
  const navigate = useNavigate();
  const [mostrarModalBaneo, setMostrarModalBaneo] = useState(false);
  const [duracionBaneo, setDuracionBaneo] = useState(60); 
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);


  useEffect(() => {
  const r = localStorage.getItem("rol");
  if (r !== "admin") {
    setTimeout(() => navigate("/"), 0);
    return;
  }
  fetchReportes();
}, []);

  const fetchReportes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/reportes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportes(res.data);
    } catch (err) {
      console.error("Error al obtener reportes", err);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/reportes/${id}`,
        { estado: nuevoEstado },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchReportes();
    } catch (err) {
      console.error("Error actualizando estado del reporte", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-petblue mb-6">Gestor de Reportes</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow rounded">
            <thead>
              <tr className="bg-petblue text-white">
                <th className="p-3 text-left">Denunciante</th>
                <th className="p-3 text-left">Denunciado</th>
                <th className="p-3 text-left">Motivo</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte._id} className="border-t">
                  <td className="p-3">{reporte.remitente?.nombre || "-"}</td>
                  <td className="p-3">{reporte.destinatario?.nombre || "-"}</td>
                  <td className="p-3">{reporte.motivo}</td>
                  <td className="p-3">{new Date(reporte.fecha).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{reporte.estado}</td>
                  <td className="p-3 space-x-2">
                    {reporte.estado === "abierto" && (
                      <>
                        <button
                          onClick={() => actualizarEstado(reporte._id, "rechazado")}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => {
                            setReporteSeleccionado(reporte);
                            setDuracionBaneo(60);
                            setMostrarModalBaneo(true);
                          }}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Banear
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {mostrarModalBaneo && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded shadow-lg space-y-4 w-96">
      <h2 className="text-xl font-bold text-center">Duración del Baneo</h2>
      <p className="text-sm text-center mb-2">Indica cuántos minutos estará baneado el usuario:</p>
      <input
        type="number"
        className="w-full border rounded p-2"
        value={duracionBaneo}
        min={1}
        onChange={(e) => setDuracionBaneo(parseInt(e.target.value))}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setMostrarModalBaneo(false)}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");
              const hasta = new Date(Date.now() + duracionBaneo * 60000);

              await api.put(
                `/api/usuarios/banear/${reporteSeleccionado.destinatario._id}`,
                { baneadoHasta: hasta.toISOString() },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              await actualizarEstado(reporteSeleccionado._id, "baneado");

              setMostrarModalBaneo(false);
            } catch (err) {
              console.error("Error baneando usuario:", err);
            }
          }}
          className="bg-red-600 text-white px-4 py-1 rounded"
        >
          Confirmar Baneo
        </button>
      </div>
    </div>
  </div>
)}
      <Footer />
    </>
  );
};

export default AdminReportes;

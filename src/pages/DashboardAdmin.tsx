import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [filtroInicio, setFiltroInicio] = useState<string>("");
  const [filtroFin, setFiltroFin] = useState<string>("");

  const [rol, setRol] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";


useEffect(() => {
  const r = localStorage.getItem("rol");
  setRol(r);
  if (r !== "admin"){
    navigate("/");
  }else{
    fetchStats();
  }
}, []);
  const fetchStatsConFiltro = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!filtroInicio) return;
  
      const [anio, mes] = filtroInicio.split("-");
  
      const res = await fetch(`${baseUrl}/api/admin/estadisticas?anio=${anio}&mes=${mes}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error al filtrar estadísticas:", err);
    }
  };
  const exportarDashboardAExcel = () => {
    const wb = XLSX.utils.book_new();
  
    const hojaEstadisticas = [
      ["Métrica", "Valor"],
      ["Total Usuarios", stats.usuarios.totalUsuarios],
      ["Clientes", stats.usuarios.totalClientes],
      ["Acompañantes", stats.usuarios.totalAcompanantes],
      ["Solicitudes Pendientes", stats.solicitudes.solicitudesPendientes],
      ["Solicitudes Aceptadas", stats.solicitudes.solicitudesAceptadas],
      ["Solicitudes Rechazadas", stats.solicitudes.solicitudesRechazadas],
      ["Acompañantes sin verificar", stats.acompanantesPendientes],
      ["Acompañantes verificados", stats.acompanantesVerificados],
      ["Acompañantes rechazados", stats.acompanantesRechazados]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(hojaEstadisticas);
    XLSX.utils.book_append_sheet(wb, ws1, "Resumen");
  
    const hojaUsuarios = [
      ["Mes", "Usuarios Registrados"],
      ...monthlyData.map(m => [m.mes, m.usuarios])
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(hojaUsuarios);
    XLSX.utils.book_append_sheet(wb, ws2, "Usuarios por mes");
  
    const hojaSolicitudes = [
      ["Mes", "Solicitudes Aceptadas"],
      ...monthlyData.map(m => [m.mes, m.solicitudesAceptadas])
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(hojaSolicitudes);
    XLSX.utils.book_append_sheet(wb, ws3, "Solicitudes por mes");
  
    const blob = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buf = new ArrayBuffer(blob.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < blob.length; i++) view[i] = blob.charCodeAt(i);
    const finalBlob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(finalBlob, "dashboard_pettravelbuddy.xlsx");
  };
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/admin/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/admin/estadisticas-mensuales`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error("Error al obtener estadísticas");
      }
      const data = await res1.json();
      const mensuales = await res2.json();

      const meses = Array.from({ length: 12 }, (_, i) => i + 1);
      const ahora = new Date();
      const añoActual = ahora.getFullYear();

      const grafico = meses.map((mes) => {
        const label = new Date(añoActual, mes - 1).toLocaleString("es-ES", { month: "short" });
        const usuarios = mensuales.usuariosPorMes.find((u) => u._id.mes === mes)?.total || 0;
        const solicitudesAceptadas = mensuales.solicitudesPorMes.find((s) => s._id.mes === mes)?.total || 0;
        return { mes: label, usuarios, solicitudesAceptadas };
      });

      setStats(data);
      setMonthlyData(grafico);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  };
  

  if (!stats) return <p className="p-6">Cargando estadísticas...</p>;

  return (
    <> 
    <Navbar />
    <div className="p-6">
      <h1 className="text-3xl font-bold text-petblue mb-6">Dashboard</h1>
      <div className="mb-6 flex gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mes:</label>
        <input
          type="month"
          value={filtroInicio}
          onChange={(e) => setFiltroInicio(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <button
        onClick={fetchStatsConFiltro}
        className="bg-petblue text-white px-4 py-2 rounded"
      >
        Filtrar
      </button>
      <button
        onClick={() => {
          setFiltroInicio("");     
          fetchStats();            
        }}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
      >
        Borrar filtro
      </button>
      <button
        onClick={exportarDashboardAExcel}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Exportar
      </button>

    </div>



      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <Card title="Total Usuarios" value={stats.usuarios.totalUsuarios} />
        <Card title="Clientes" value={stats.usuarios.totalClientes} />
        <Card title="Acompañantes" value={stats.usuarios.totalAcompanantes} />
        <Card title="Solicitudes Pendientes" value={stats.solicitudes.solicitudesPendientes} />
        <Card title="Solicitudes Aceptadas por Acompañantes" value={stats.solicitudes.solicitudesAceptadas} />
        <Card title="Solicitudes Rechazadas por Acompañantes" value={stats.solicitudes.solicitudesRechazadas} />
        <Card title="Acompañantes sin verificar" value={stats.acompanantesPendientes} />
        <Card title="Acompañantes verificados" value={stats.acompanantesVerificados} />
        <Card title="Acompañantes rechazados" value={stats.acompanantesRechazados} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        {}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4 text-petblue">Usuarios registrados por mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usuarios" stroke="#007BFF" name="Usuarios registrados" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-petblue">Solicitudes aceptadas por mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="solicitudesAceptadas" stroke="#28a745" name="Solicitudes aceptadas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

const Card = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold text-petblue">{value}</p>
  </div>
);


export default DashboardAdmin;


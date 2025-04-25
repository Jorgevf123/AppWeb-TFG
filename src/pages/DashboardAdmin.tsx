import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "admin") navigate("/");

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/estadisticas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <p className="p-6">Cargando estadísticas...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-petblue mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card title="Total Usuarios" value={stats.usuarios.totalUsuarios} />
        <Card title="Clientes" value={stats.usuarios.totalClientes} />
        <Card title="Acompañantes" value={stats.usuarios.totalAcompanantes} />
        <Card title="Solicitudes Pendientes" value={stats.solicitudes.solicitudesPendientes} />
        <Card title="Solicitudes Aceptadas" value={stats.solicitudes.solicitudesAceptadas} />
        <Card title="Solicitudes Rechazadas" value={stats.solicitudes.solicitudesRechazadas} />
        <Card title="Acompañantes sin verificar" value={stats.acompanantesPendientes} />
        <Card title="Acompañantes verificados" value={stats.acompanantesVerificados} />
        <Card title="Acompañantes rechazados" value={stats.acompanantesRechazados} />
      </div>
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold text-petblue">{value}</p>
  </div>
);

export default DashboardAdmin;

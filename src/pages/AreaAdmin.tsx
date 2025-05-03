import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AreaAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "admin") {
      navigate("/");
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-petblue mb-6">
            Panel de Administración
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            className="bg-petblue text-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/area-admin/verificar")}
          >
            <h2 className="text-xl font-semibold mb-2">Verificar Acompañantes</h2>
          </div>
          <div
            className="bg-red-400 text-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/area-admin/reportes")}
          >
            <h2 className="text-xl font-semibold mb-2">Gestionar Reportes</h2>
          </div>
          <div
            className="bg-petblue-light text-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/area-admin/dashboard")}
          >
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AreaAdmin;


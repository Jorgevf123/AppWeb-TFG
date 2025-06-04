import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AreaCliente from "./pages/AreaCliente";
import AreaAcompanante from "./pages/AreaAcompanante";
import FormularioViaje from "./pages/FormularioViaje";
import SolicitudMascota from "./pages/SolicitudMascota";
import ChatPrivado from './pages/ChatPrivado';
import Perfil from "@/pages/Perfil";
import EditarPerfil from "@/pages/EditarPerfil";
import AreaAdmin from "@/pages/AreaAdmin";
import VerificarAcompanantes from "@/pages/VerificarAcompanantes";
import DashboardAdmin from "@/pages/DashboardAdmin";
import PerfilAcompanante from "@/pages/PerfilAcompanante";
import TerminosCondiciones from "@/pages/TerminosCondiciones";
import PoliticaPrivacidad from "@/pages/PoliticaPrivacidad";
import PoliticaCookies from "@/pages/PoliticaCookies";
import AdminReportes from "@/pages/AdminReportes";
import { useEffect, useState } from "react";
import OlvideContrasena from "@/pages/OlvideContrasena";
import RestablecerContrasena from "@/pages/RestablecerContrasena";



const queryClient = new QueryClient();
const App = () => {
  const [authRefresh, setAuthRefresh] = useState(0);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("rol");
    setRol(r);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/area-cliente" element={<AreaCliente />} />
          <Route path="/area-acompanante" element={<AreaAcompanante />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/acompanante/viaje/:tipo" element={<FormularioViaje />} />
          <Route path="/solicitud/:acompananteId" element={<SolicitudMascota />} />
          <Route path="/chat/:userId" element={<ChatPrivado />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/area-admin" element={<AreaAdmin />} />
          <Route path="/area-admin/verificar" element={<VerificarAcompanantes />} />
          <Route path="/area-admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/perfil/:id" element={rol === "cliente" ? <PerfilAcompanante /> : <Navigate to="/" replace />}/>
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/politica-cookies" element={<PoliticaCookies />} />
          <Route path="/area-admin/reportes" element={<AdminReportes />} />
          <Route path="/" element={<Index authRefresh={authRefresh} />} />
          <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
          <Route path="/restablecer-contrasena/:token" element={<RestablecerContrasena />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
}

export default App;

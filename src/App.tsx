import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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

          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

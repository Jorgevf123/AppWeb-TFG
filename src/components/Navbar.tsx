import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Train, Menu, X, User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type NavbarProps = {
  authRefresh?: number;
};
const Navbar = ({ authRefresh }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState<{ rol: string; imagenPerfil: string } | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const imagenPerfil = userData?.imagenPerfil;


  const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  setIsLoggedIn(!!localStorage.getItem("token"));
}, []);

  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const backendURL = window.location.hostname.includes("localhost")
        ? "http://localhost:5000/api"
        : "http://18.214.63.24:5000/api";

      const res = await fetch(`${backendURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn("No autorizado o token inválido:", res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.warn("⚠️ La respuesta no es JSON. Respuesta vacía u otro formato.");
        return;
      }

      const data = await res.json();

      if (!data || !data.rol) {
        console.warn("⚠️ El usuario no tiene rol definido.");
        return;
      }

      setUserData({
        rol: data.rol,
        imagenPerfil: data.imagenPerfil || "",
      });

      setIsLoggedIn(true); // 🔥 AÑADIDO para actualizar el menú
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
    }
  };

  fetchUser();
}, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload(); // Opcional: fuerza recarga del navbar
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="text-petblue">
            <Plane className="h-6 w-6 inline-block mr-1" />
            <Train className="h-6 w-6 inline-block" />
          </div>
          <span className="font-montserrat font-bold text-xl text-petblue">
            PetTravelBuddy
          </span>
        </div>
  
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="/#como-funciona" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Cómo Funciona
          </a>
          <a href="/#acompanantes" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Acompañantes
          </a>
          <a href="/#faq" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            FAQ
          </a>
        </div>
  
        {/* Perfil y Botón Menú */}
        <div className="flex items-center gap-4">
          {/* Menú de perfil SIEMPRE visible */}
          <div className="relative" ref={profileMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-petblue"
            >
              {imagenPerfil ? (
                <img
                  src={imagenPerfil}
                  alt="Perfil"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
  
            {/* Menú desplegable de opciones */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-lg py-2 z-50">
                {isLoggedIn ? (
                  <>
                    {userData?.rol === "cliente" && (
                      <a
                        href="/area-cliente"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      >
                        Área Cliente
                      </a>
                    )}
                    {userData?.rol === "acompanante" && (
                      <a
                        href="/area-acompanante"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      >
                        Área Acompañante
                      </a>
                    )}
                    {userData?.rol === "admin" && (
                      <a
                        href="/area-admin"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      >
                        Área Admin
                      </a>
                    )}
                    <a
                      href="/perfil"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    >
                      Ver Perfil
                    </a>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
  
          {/* Botón Menú Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
  
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <a
              href="/#como-funciona"
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Cómo Funciona
            </a>
            <a
              href="/#servicios"
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Servicios
            </a>
            <a
              href="/#acompanantes"
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Acompañantes
            </a>
            <a
              href="/#faq"
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  className="bg-petblue hover:bg-petblue-light text-white font-medium text-center w-full py-2 rounded transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-petblue hover:bg-petblue-light text-white font-medium text-center w-full py-2 rounded transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


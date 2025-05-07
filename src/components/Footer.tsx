import React from 'react';
import { Plane, Train, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <div className="mr-2">
                <Plane className="h-5 w-5 inline-block mr-1 text-petgreen" />
                <Train className="h-5 w-5 inline-block text-petgreen" />
              </div>
              <span className="font-montserrat font-bold text-xl text-white">PetTravelBuddy</span>
            </div>
            <p className="mb-4">
              Servicio profesional de acompañamiento para mascotas en viajes por avión y tren por toda España.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-petgreen transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-petgreen transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-petgreen transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/#como-funciona" className="hover:text-petgreen transition-colors">Cómo Funciona</a></li>
              <li><a href="/#servicios" className="hover:text-petgreen transition-colors">Servicios</a></li>
              <li><a href="/#acompanantes" className="hover:text-petgreen transition-colors">Acompañantes</a></li>
              <li><a href="/#faq" className="hover:text-petgreen transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-petgreen transition-colors">Blog</a></li>
              <li><a href="/login?admin=true" className="hover:text-petgreen transition-colors">Área de Administración</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Servicios</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-petgreen transition-colors">Acompañamiento en Avión</a></li>
              <li><a href="#" className="hover:text-petgreen transition-colors">Acompañamiento en Tren</a></li>
              <li><a href="#" className="hover:text-petgreen transition-colors">Traslados de Emergencia</a></li>
              <li><a href="#" className="hover:text-petgreen transition-colors">Viajes Internacionales</a></li>
              <li><a href="#" className="hover:text-petgreen transition-colors">Seguro de Viaje</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-petgreen shrink-0 mt-0.5" />
                <a href="mailto:pettravelbuddy.notif@gmail.com" className="hover:text-petgreen transition-colors">pettravelbuddy.notif@gmail.com</a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-petgreen shrink-0 mt-0.5" />
                <a href="tel:+34611234567" className="hover:text-petgreen transition-colors">+34 611 234 567</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear} PetTravelBuddy. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/terminos-condiciones" className="text-gray-500 hover:text-petgreen transition-colors">Términos y Condiciones</Link>
            <Link to="/politica-privacidad" className="text-gray-500 hover:text-petgreen transition-colors">Política de Privacidad</Link>
            <Link to="/politica-cookies" className="text-gray-500 hover:text-petgreen transition-colors">Política de Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

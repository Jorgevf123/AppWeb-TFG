import React from 'react';
import { Plane, Train, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 justify-center">
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="mr-2">
                <Plane className="h-5 w-5 inline-block mr-1 text-petgreen" />
                <Train className="h-5 w-5 inline-block text-petgreen" />
              </div>
              <span className="font-montserrat font-bold text-xl text-white">PetTravelBuddy</span>
            </div>
            <p className="mb-4 text-center md:text-left">
              Servicio profesional de acompañamiento para mascotas en viajes por avión y tren por toda España.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
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
          
          <div className="text-center">
            <h3 className="font-bold text-white mb-4 text-lg">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/#como-funciona" className="hover:text-petgreen transition-colors">Cómo Funciona</a></li>
              <li><a href="/#acompanantes" className="hover:text-petgreen transition-colors">Acompañantes</a></li>
              <li><a href="/#faq" className="hover:text-petgreen transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="/login?admin=true" className="hover:text-petgreen transition-colors">Área de Administración</a></li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h3 className="font-bold text-white mb-4 text-lg">Contacto</h3>
            <ul className="space-y-3 text-center md:text-right">
              <li className="flex items-center justify-center md:justify-end">
                <Mail className="h-5 w-5 mr-2 text-petgreen" />
                <a href="mailto:pettravelbuddy.notif@gmail.com" className="hover:text-petgreen transition-colors">pettravelbuddy.notif@gmail.com</a>
              </li>
              <li className="flex items-center justify-center md:justify-end">
                <Phone className="h-5 w-5 mr-2 text-petgreen" />
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

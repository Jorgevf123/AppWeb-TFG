
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plane, Train, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-petblue">
            <Plane className="h-6 w-6 inline-block mr-1" />
            <Train className="h-6 w-6 inline-block" />
          </div>
          <span className="font-montserrat font-bold text-xl text-petblue">PetTravelBuddy</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#como-funciona" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Cómo Funciona
          </a>
          <a href="#servicios" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Servicios
          </a>
          <a href="#acompanantes" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            Acompañantes
          </a>
          <a href="#faq" className="text-petblue hover:text-petblue-light font-medium transition-colors">
            FAQ
          </a>
          <Button className="bg-petblue hover:bg-petblue-light text-white font-medium">
            Iniciar Sesión
          </Button>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <a 
              href="#como-funciona" 
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Cómo Funciona
            </a>
            <a 
              href="#servicios" 
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Servicios
            </a>
            <a 
              href="#acompanantes" 
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Acompañantes
            </a>
            <a 
              href="#faq" 
              className="text-petblue hover:text-petblue-light font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <Button className="bg-petblue hover:bg-petblue-light text-white font-medium w-full">
              Iniciar Sesión
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

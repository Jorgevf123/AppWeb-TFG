
import React from 'react';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const companions = [
  {
    name: "Ana García",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.9,
    reviews: 156,
    experience: "4 años de experiencia",
    bio: "Veterinaria y amante de los animales. Especializada en el cuidado de animales durante viajes largos.",
    badge: "Veterinaria"
  },
  {
    name: "Miguel Fernández",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    reviews: 124,
    experience: "3 años de experiencia",
    bio: "Adiestrador canino con amplia experiencia en el manejo de perros de todas las razas y tamaños.",
    badge: "Adiestrador"
  },
  {
    name: "Laura Martínez",
    image: "https://randomuser.me/api/portraits/women/67.jpg",
    rating: 4.7,
    reviews: 98,
    experience: "2 años de experiencia",
    bio: "Técnico en cuidados animales. Especialista en gatos y animales exóticos. Paciente y cariñosa.",
    badge: "Tec. Animal"
  }
];

const Companions = () => {
  return (
    <section id="acompanantes" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-petblue mb-4">Nuestros Acompañantes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profesionales verificados y amantes de los animales que cuidarán de tu mascota como si fuera suya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {companions.map((companion, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-petblue">
                      <AvatarImage src={companion.image} alt={companion.name} />
                      <AvatarFallback>{companion.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-petblue">{companion.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{companion.rating}</span>
                        <span className="text-gray-500 text-sm">({companion.reviews} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="bg-petgreen text-petblue-dark text-xs font-medium px-2 py-1 rounded-full">
                          {companion.badge}
                        </span>
                        <span className="text-sm text-gray-600">{companion.experience}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{companion.bio}</p>
                </div>
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center text-gray-500 hover:text-petblue transition-colors">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Contactar</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-petblue transition-colors">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">Reseñas</span>
                    </button>
                  </div>
                  <Button size="sm" variant="outline" className="text-petblue border-petblue hover:bg-petblue hover:text-white transition-colors">
                    Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="text-petblue border-petblue hover:bg-petblue hover:text-white transition-colors">
            Ver Todos los Acompañantes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Companions;

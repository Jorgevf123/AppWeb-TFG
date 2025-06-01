import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import api from "@/utils/api";

const SolicitudMascota = () => {
  const { acompananteId } = useParams<{ acompananteId: string }>();
  const [tipoAnimal, setTipoAnimal] = useState('');
  const [raza, setRaza] = useState('');
  const [dimensiones, setDimensiones] = useState('');
  const [vacunasAlDia, setVacunasAlDia] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [sugerenciasTipo, setSugerenciasTipo] = useState<string[]>([]);
  const [sugerenciasRaza, setSugerenciasRaza] = useState<string[]>([]);
  const [acompanante, setAcompanante] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setSugerenciasTipo(['perro', 'gato', 'conejo', 'ave']);
  }, []);
  useEffect(() => {
    if (acompananteId) {
      api.get(`/api/users/${acompananteId}`)
        .then(res => setAcompanante(res.data))
        .catch(err => console.error('Error cargando acompañante', err));
    }
  }, [acompananteId]);

  useEffect(() => {
    const cargarRazas = async () => {
      const animal = tipoAnimal.toLowerCase();

      if (animal === 'perro') {
        try {
          const res = await axios.get("https://api.thedogapi.com/v1/breeds", {
            headers: {
              "x-api-key": "live_Sl9EP02Bsb6czHPWVFQ6zBzpEfX02EOGgrvtxqgU66LJvHXfcSTBqgS7cZruOLqk"
            }
          });
          const nombresRazas = res.data.map((r: any) => r.name);
          setSugerenciasRaza(nombresRazas);
        } catch (err) {
          console.error("Error al obtener razas de perro:", err);
          setSugerenciasRaza([]);
        }
      } else if (animal === 'gato') {
        try {
          const res = await axios.get("https://api.thecatapi.com/v1/breeds", {
            headers: {
              "x-api-key": "live_ZlJQ4lNUvK052ZpYzl9vAkDsj5eAgKlhQGwe2cJUtJY20edXEivsBiy1ltkPEHfU"
            }
          });
          const nombresRazas = res.data.map((r: any) => r.name);
          setSugerenciasRaza(nombresRazas);
        } catch (err) {
          console.error("Error al obtener razas de gato:", err);
          setSugerenciasRaza([]);
        }
      } else {
        const animalesYrazas: Record<string, string[]> = {
          conejo: ['Toy', 'Cabeza de león'],
          ave: ['Loro', 'Periquito', 'Canario']
        };
        setSugerenciasRaza(animalesYrazas[animal] || []);
      }
    };

    if (tipoAnimal.trim() !== '') cargarRazas();
  }, [tipoAnimal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clienteId = localStorage.getItem('userId');
    if (!clienteId) return setMensaje('Debes iniciar sesión.');

    const regex = /^\d+\s*x\s*\d+\s*x\s*\d+$/i;
    if (!regex.test(dimensiones.trim())) {
      return setMensaje('Formato de dimensiones incorrecto. Usa "60 x 40 x 30".');
    }

    try {
      await api.post(
        '/api/solicitudes',
        {
          acompananteId,
          tipoAnimal,
          raza,
          dimensiones,
          vacunasAlDia
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setMensaje('Solicitud enviada con éxito');
      setTimeout(() => navigate('/area-cliente'), 2000);
    } catch (err) {
      console.error(err);
      setMensaje('Error al enviar la solicitud');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md space-y-6">
      {acompanante && (
        <p className="text-center text-lg text-gray-700 mb-4">
          Estás solicitando a <strong>{acompanante.nombre}</strong>
        </p>
      )}
        <h1 className="text-2xl font-bold text-petblue mb-4">Datos de tu mascota</h1>
        {mensaje && <p className="text-center text-red-500">{mensaje}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block font-medium">Tipo de animal</label>
            <input
              type="text"
              value={tipoAnimal}
              onChange={(e) => setTipoAnimal(e.target.value)}
              required
              list="tipos"
              className="w-full p-2 border rounded"
              placeholder="Ej. Perro"
            />
            <datalist id="tipos">
              {Array.isArray(sugerenciasTipo) && sugerenciasTipo.map((tipo, idx) => (
                <option key={idx} value={tipo} />
              ))}
            </datalist>
          </div>

          <div className="relative">
            <label className="block font-medium">Raza</label>
            <input
              type="text"
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              required
              list="razas"
              className="w-full p-2 border rounded"
              placeholder="Ej. Labrador"
            />
            <datalist id="razas">
              {Array.isArray(sugerenciasRaza) && sugerenciasRaza.map((raza, idx) => (
                <option key={idx} value={raza} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-medium">Dimensiones (largo x ancho x alto en cm)</label>
            <input
              type="text"
              value={dimensiones}
              onChange={(e) => setDimensiones(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Ej. 60 x 40 x 30"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={vacunasAlDia}
              onChange={() => setVacunasAlDia(!vacunasAlDia)}
              className="mr-2"
            />
            <label className="font-medium">¿Tiene las vacunas al día?</label>
          </div>

          <button
            type="submit"
            className="w-full bg-petblue text-white py-2 rounded hover:bg-petblue-light transition"
          >
            Enviar solicitud
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default SolicitudMascota;




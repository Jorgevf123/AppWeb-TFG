import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SolicitudMascota = () => {
  const { acompananteId } = useParams<{ acompananteId: string }>();
  const [tipoAnimal, setTipoAnimal] = useState('');
  const [raza, setRaza] = useState('');
  const [dimensiones, setDimensiones] = useState('');
  const [vacunasAlDia, setVacunasAlDia] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clienteId = localStorage.getItem('userId');
    if (!clienteId) return setMensaje('Debes iniciar sesión.');

    try {
      await axios.post('http://localhost:5000/api/solicitudes',
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
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-petblue mb-4">Datos de tu mascota</h1>
      {mensaje && <p className="text-center text-green-600">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Tipo de animal</label>
          <input
            type="text"
            value={tipoAnimal}
            onChange={(e) => setTipoAnimal(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="Ej. Perro"
          />
        </div>

        <div>
          <label className="block font-medium">Raza</label>
          <input
            type="text"
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="Ej. Labrador"
          />
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
  );
};

export default SolicitudMascota;

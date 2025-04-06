import React from "react";

const AreaCliente = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-petblue">Área de Usuario</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Listado Acompañantes</h2>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          <li>Acompañante 1 <button className="ml-4 text-white bg-petblue px-2 py-1 rounded">Aceptar</button></li>
          <li>Acompañante 2 <button className="ml-4 text-white bg-petblue px-2 py-1 rounded">Aceptar</button></li>
          <li>Acompañante 3 <button className="ml-4 text-white bg-petblue px-2 py-1 rounded">Aceptar</button></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Acompañantes Aceptados</h2>
        <ul className="bg-white shadow rounded-lg p-4 space-y-2">
          <li>Acompañante 1 <button className="ml-4 bg-red-500 text-white px-2 py-1 rounded">Rechazar</button> <button className="ml-2 text-white bg-petblue px-2 py-1 rounded">Aceptar</button></li>
        </ul>
      </section>
    </div>
  );
};

export default AreaCliente;

  
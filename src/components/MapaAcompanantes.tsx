import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Corrige los iconos por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapaAcompanantes = () => {
  const [acompanantes, setAcompanantes] = useState([]);
  const madrid: [number, number] = [40.4168, -3.7038];

  useEffect(() => {
    axios.get("/api/auth/acompanantes")
      .then(res => setAcompanantes(res.data));
  }, []);

  return (
    <div className="h-[400px] w-full rounded-md shadow">
      <MapContainer center={madrid} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {acompanantes.map((a: any, i: number) => (
          <Marker key={i} position={a.ubicacion || madrid}>
            <Popup>
              {a.nombre} <br />
              {a.email}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaAcompanantes;


const express = require("express");
const axios = require("axios");
const router = express.Router();

const ORS_API_KEY = process.env.ORS_API_KEY;

router.get("/ruta", async (req, res) => {
  const { origenLat, origenLng, destinoLat, destinoLng } = req.query;

  if (!origenLat || !origenLng || !destinoLat || !destinoLng) {
    return res.status(400).json({ error: "Faltan coordenadas" });
  }

  try {
    const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

    const response = await axios.post(
      url,
      {
        coordinates: [
          [parseFloat(origenLng), parseFloat(origenLat)],
          [parseFloat(destinoLng), parseFloat(destinoLat)]
        ]
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error ORS:", err.response?.data || err.message);
    res.status(500).json({ error: "No se pudo obtener la ruta desde ORS" });
  }
});

module.exports = router;


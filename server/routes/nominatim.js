const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/buscar", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Falta parámetro 'q'" });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=es`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "PetTravelBuddy/1.0 (contacto: pettravelbuddy.notif@gmail.com)",
        "Accept": "application/json"
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Error al consultar Nominatim" });
  }
});

router.get("/coordenadas", async (req, res) => {
  const { lugar } = req.query;
  if (!lugar) return res.status(400).json({ error: "Falta parámetro 'lugar'" });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(lugar)}&format=json&limit=1`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "PetTravelBuddy/1.0 (contacto: pettravelbuddy.notif@gmail.com)",
        "Accept": "application/json"
      }
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      const item = response.data[0];
      if (item.lat && item.lon) {
        return res.json({ lat: item.lat, lon: item.lon });
      } else {
        console.error("Respuesta inválida de Nominatim:", item);
        return res.status(500).json({ error: "Formato inesperado de coordenadas" });
      }
    } else {
      console.warn("Sin resultados de Nominatim para:", lugar);
      return res.status(404).json({ error: "No se encontraron coordenadas" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error al consultar coordenadas" });
  }
});

module.exports = router;

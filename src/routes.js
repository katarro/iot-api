const express = require("express");
const router = express.Router();
const db = require("./db");

// Consultar datos del sensor (GET)
router.get("/api/v1/sensor_data", (req, res) => {
  const { company_api_key, from, to, sensor_ids } = req.query;

  db.query("SELECT id FROM Company WHERE company_api_key = ?", [company_api_key], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error", message: err.message });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid company API key" });
    }

    const sensorIdList = sensor_ids.split(',').map(id => parseInt(id));
    const query = `
      SELECT * FROM SensorData 
      WHERE sensor_id IN (?) 
      AND timestamp BETWEEN ? AND ?
    `;
    db.query(query, [sensorIdList, from, to], (err, results) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: "Database error", message: err.message });
      }
      res.json(results);
    });
  });
});

// Crear un sensor (POST)
router.post("/api/v1/sensors", (req, res) => {
  const { location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key } = req.body;

  db.query(
    "INSERT INTO Sensor (location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key) VALUES (?, ?, ?, ?, ?)",
    [location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: "Database error", message: err.message });
      }
      res.status(201).json({ message: "Sensor inserted", id: result.insertId });
    }
  );
});

// Obtener todos los sensores (GET)
router.get("/api/v1/sensors", (req, res) => {
  db.query("SELECT * FROM Sensor", (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error", message: err.message });
    }
    res.json(results);
  });
});

// Obtener un sensor (GET)
router.get("/api/v1/sensors/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM Sensor WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error", message: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Sensor not found" });
    }
    res.json(results[0]);
  });
});

// Actualizar un sensor (PUT)
router.put("/api/v1/sensors/:id", (req, res) => {
  const { id } = req.params;
  const { location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key } = req.body;

  db.query(
    "UPDATE Sensor SET location_id = ?, sensor_name = ?, sensor_category = ?, sensor_meta = ?, sensor_api_key = ? WHERE id = ?",
    [location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key, id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: "Database error", message: err.message });
      }
      res.status(200).json({ message: "Sensor updated" });
    }
  );
});

// Eliminar un sensor (DELETE)
router.delete("/api/v1/sensors/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Sensor WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error", message: err.message });
    }
    res.status(200).json({ message: "Sensor deleted" });
  });
});

module.exports = router;

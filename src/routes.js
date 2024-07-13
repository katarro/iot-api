const express = require("express");
const router = express.Router();
const db = require("./db");

// Consultar datos del sensor (GET)
// Consultar datos del sensor (GET)
router.get("/api/v1/sensor_data", (req, res) => {
  const { sensor_api_key, from, to, sensor_ids } = req.query;
  console.log("Received query params:", req.query);
  // Verificar si faltan parámetros
  if (!sensor_api_key || !from || !to || !sensor_ids) {
    console.error("Missing required query parameters");
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  db.query(
    "SELECT id FROM Sensor WHERE sensor_api_key = ?",
    [sensor_api_key],
    (err, results) => {
      if (err) {
        console.error("Database error on sensor lookup:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      if (results.length === 0) {
        console.error("Invalid sensor API key");
        return res.status(400).json({ error: "Invalid sensor API key" });
      }

      const sensorIdList = sensor_ids.split(",").map((id) => parseInt(id));
      if (sensorIdList.some(isNaN)) {
        console.error("Invalid sensor_ids format:", sensor_ids);
        return res.status(400).json({ error: "Invalid sensor_ids format" });
      }

      const query = `
      SELECT * FROM SensorData 
      WHERE sensor_id IN (?) 
      AND timestamp BETWEEN ? AND ?
    `;
      console.log("Executing query with params:", { sensorIdList, from, to });
      db.query(
        query,
        [sensorIdList, parseInt(from), parseInt(to)],
        (err, results) => {
          if (err) {
            console.error("Database error on sensor data lookup:", err.message);
            return res
              .status(500)
              .json({ error: "Database error", message: err.message });
          }
          console.log("Query results:", results);
          res.json(results);
        }
      );
    }
  );
});

// Crear un sensor (POST)
router.post("/api/v1/sensors", (req, res) => {
  const {
    location_id,
    sensor_name,
    sensor_category,
    sensor_meta,
    sensor_api_key,
  } = req.body;

  if (
    !location_id ||
    !sensor_name ||
    !sensor_category ||
    !sensor_meta ||
    !sensor_api_key
  ) {
    return res.status(400).json({ error: "Missing required body parameters" });
  }

  db.query(
    "INSERT INTO Sensor (location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key) VALUES (?, ?, ?, ?, ?)",
    [location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
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
      return res
        .status(500)
        .json({ error: "Database error", message: err.message });
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
      return res
        .status(500)
        .json({ error: "Database error", message: err.message });
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
  const {
    location_id,
    sensor_name,
    sensor_category,
    sensor_meta,
    sensor_api_key,
  } = req.body;

  if (
    !location_id ||
    !sensor_name ||
    !sensor_category ||
    !sensor_meta ||
    !sensor_api_key
  ) {
    return res.status(400).json({ error: "Missing required body parameters" });
  }

  db.query(
    "UPDATE Sensor SET location_id = ?, sensor_name = ?, sensor_category = ?, sensor_meta = ?, sensor_api_key = ? WHERE id = ?",
    [
      location_id,
      sensor_name,
      sensor_category,
      sensor_meta,
      sensor_api_key,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
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
      return res
        .status(500)
        .json({ error: "Database error", message: err.message });
    }
    res.status(200).json({ message: "Sensor deleted" });
  });
});

// Agregar datos a un sensor (POST)
router.post("/api/v1/sensor_data", (req, res) => {
  const { sensor_id, json_data, timestamp } = req.body;

  if (!sensor_id || !json_data || !timestamp) {
    return res.status(400).json({ error: "Missing required body parameters" });
  }

  db.query(
    "INSERT INTO SensorData (sensor_id, json_data, timestamp) VALUES (?, ?, ?)",
    [sensor_id, json_data, timestamp],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      res
        .status(201)
        .json({ message: "Sensor data inserted", id: result.insertId });
    }
  );
});

module.exports = router;

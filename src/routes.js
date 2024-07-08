const express = require("express");
const router = express.Router();
const db = require("./db");

// Endpoint para insertar datos del sensor
router.post("/api/v1/sensor_data", (req, res) => {
  const { api_key, json_data } = req.body;
  db.get(
    "SELECT id FROM Sensor WHERE sensor_api_key = ?",
    [api_key],
    (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (!row) return res.status(400).send("Invalid sensor API key");

      const sensor_id = row.id;
      const timestamp = Math.floor(Date.now() / 1000);
      db.run(
        "INSERT INTO SensorData (sensor_id, json_data, timestamp) VALUES (?, ?, ?)",
        [sensor_id, JSON.stringify(json_data), timestamp],
        function (err) {
          if (err) return res.status(500).send(err.message);
          res.status(201).send("Data inserted");
        }
      );
    }
  );
});

// Endpoint para consultar datos del sensor
router.get("/api/v1/sensor_data", (req, res) => {
  const { company_api_key, from, to, sensor_id } = req.query;
  db.all(
    "SELECT * FROM SensorData WHERE sensor_id IN (?) AND timestamp BETWEEN ? AND ?",
    [sensor_id.split(","), from, to],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    }
  );
});

module.exports = router;

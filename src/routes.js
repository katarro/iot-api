const express = require("express");
const router = express.Router();
const db = require("./db");

// Endpoint para insertar datos del sensor
router.post("/api/v1/sensor_data", (req, res) => {
  const { company_api_key, sensor_id, json_data } = req.body;

  if (!company_api_key || !sensor_id || !json_data) {
    return res.status(400).send("Missing required body parameters");
  }

  // Verificar que la company_api_key es válida
  db.get(
    "SELECT id FROM Company WHERE company_api_key = ?",
    [company_api_key],
    (err, company) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send(err.message);
      }
      if (!company) {
        console.log("Invalid company API key:", company_api_key);
        return res.status(400).send("Invalid company API key");
      }

      const company_id = company.id;

      // Verificar que el sensor pertenece a la compañía
      db.get(
        "SELECT id FROM Sensor WHERE id = ? AND company_id = ?",
        [sensor_id, company_id],
        (err, sensor) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send(err.message);
          }
          if (!sensor) {
            console.log("Sensor does not belong to the company");
            return res
              .status(400)
              .send("Sensor does not belong to the company");
          }

          const timestamp = Math.floor(Date.now() / 1000);
          console.log(
            "Inserting data with sensor_id:",
            sensor_id,
            "timestamp:",
            timestamp
          );

          db.run(
            "INSERT INTO SensorData (sensor_id, json_data, timestamp) VALUES (?, ?, ?)",
            [sensor_id, JSON.stringify(json_data), timestamp],
            function (err) {
              if (err) {
                console.error("Database error:", err.message);
                return res.status(500).send(err.message);
              }
              console.log("Data inserted with sensor_id:", sensor_id);
              res.status(201).send("Data inserted");
            }
          );
        }
      );
    }
  );
});

// Endpoint para consultar datos del sensor
router.get("/api/v1/sensor_data", (req, res) => {
  const { company_api_key, from, to, sensor_ids } = req.query;

  if (!company_api_key || !from || !to || !sensor_ids) {
    return res.status(400).send("Missing required query parameters");
  }

  const fromTimestamp = parseInt(from, 10);
  const toTimestamp = parseInt(to, 10);
  const sensorIdList = sensor_ids.split(",").map((id) => parseInt(id, 10));

  console.log("Querying data with params:", {
    company_api_key,
    from: fromTimestamp,
    to: toTimestamp,
    sensor_ids: sensorIdList,
  });

  // Verificar que la company_api_key es válida
  db.get(
    "SELECT id FROM Company WHERE company_api_key = ?",
    [company_api_key],
    (err, company) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send(err.message);
      }
      if (!company) {
        console.log("Invalid company API key:", company_api_key);
        return res.status(400).send("Invalid company API key");
      }

      const company_id = company.id;

      // Verificar que los sensores pertenecen a la compañía
      db.all(
        "SELECT id FROM Sensor WHERE company_id = ? AND id IN (" +
          sensorIdList.map(() => "?").join(",") +
          ")",
        [company_id, ...sensorIdList],
        (err, sensors) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send(err.message);
          }

          if (sensors.length !== sensorIdList.length) {
            console.log("One or more sensors do not belong to the company");
            return res
              .status(400)
              .send("One or more sensors do not belong to the company");
          }

          const query =
            "SELECT * FROM SensorData WHERE sensor_id IN (" +
            sensorIdList.map(() => "?").join(",") +
            ") AND timestamp BETWEEN ? AND ?";
          const queryParams = [...sensorIdList, fromTimestamp, toTimestamp];

          console.log("SQL Query:", query);
          console.log("Query Params:", queryParams);

          db.all(query, queryParams, (err, rows) => {
            if (err) return res.status(500).send(err.message);
            console.log("Query results:", rows);
            res.json(rows);
          });
        }
      );
    }
  );
});

module.exports = router;

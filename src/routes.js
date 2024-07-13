const express = require("express");
const router = express.Router();
const db = require("./db");

function verifyCompanyApiKey(req, res, next) {
  const companyApiKey = req.query.company_api_key || req.body.company_api_key;
  if (!companyApiKey) {
    return res.status(400).json({ error: "Missing company API key" });
  }

  db.query(
    "SELECT id FROM Company WHERE company_api_key = ?",
    [companyApiKey],
    (err, results) => {
      if (err) {
        console.error("Database error on company lookup:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid company API key" });
      }

      req.companyId = results[0].id;
      next();
    }
  );
}

// Consultar todas las compañías (GET)
router.get("/api/v1/companies", (req, res) => {
  db.query("SELECT * FROM Company", (err, results) => {
    if (err) {
      console.error("Database error on company lookup:", err.message);
      return res
        .status(500)
        .json({ error: "Database error", message: err.message });
    }
    res.json(results);
  });
});

// Consultar todas las ubicaciones (GET)
router.get("/api/v1/locations", verifyCompanyApiKey, (req, res) => {
  console.log("Company ID:", req);
  db.query(
    "SELECT * FROM Location WHERE company_id = ?",
    [req.companyId],
    (err, results) => {
      if (err) {
        console.error("Database error on location lookup:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      res.json(results);
    }
  );
});

// Consultar datos del sensor (GET)
router.get("/api/v1/sensor_data", verifyCompanyApiKey, (req, res) => {
  const { from, to, sensor_ids } = req.query;
  console.log("Received query params:", req.query);

  // Verificar si faltan parámetros
  if (!from || !to || !sensor_ids) {
    console.error("Missing required query parameters");
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  const sensorIdList = sensor_ids.split(",").map((id) => parseInt(id));
  if (sensorIdList.some(isNaN)) {
    console.error("Invalid sensor_ids format:", sensor_ids);
    return res.status(400).json({ error: "Invalid sensor_ids format" });
  }

  // Verificar que los sensores pertenecen a las ubicaciones de la compañía
  const sensorQuery = `
    SELECT Sensor.id FROM Sensor
    JOIN Location ON Sensor.location_id = Location.id
    WHERE Sensor.id IN (?) AND Location.company_id = ?
  `;
  console.log("Executing sensor verification query with params:", {
    sensorIdList,
    companyId: req.companyId,
  });
  db.query(sensorQuery, [sensorIdList, req.companyId], (err, sensorResults) => {
    if (err) {
      console.error(
        "Database error on sensor verification lookup:",
        err.message
      );
      return res
        .status(500)
        .json({ error: "Database error", message: err.message });
    }

    if (sensorResults.length !== sensorIdList.length) {
      console.error(
        "One or more sensors do not belong to the company locations"
      );
      return res.status(400).json({
        error: "One or more sensors do not belong to the company locations",
      });
    }

    // Obtener los datos de los sensores verificados
    const query = `
      SELECT * FROM SensorData 
      WHERE sensor_id IN (?) 
      AND timestamp BETWEEN ? AND ?
    `;
    console.log("Executing sensor data query with params:", {
      sensorIdList,
      from,
      to,
    });
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
  });
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
router.get("/api/v1/sensors", verifyCompanyApiKey, (req, res) => {
  db.query(
    "SELECT * FROM Sensor WHERE location_id IN (SELECT id FROM Location WHERE company_id = ?)",
    [req.companyId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      res.json(results);
    }
  );
});

// Obtener un sensor (GET)
router.get("/api/v1/sensors/:id", verifyCompanyApiKey, (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM Sensor WHERE id = ? AND location_id IN (SELECT id FROM Location WHERE company_id = ?)",
    [id, req.companyId],
    (err, results) => {
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
    }
  );
});

// Actualizar un sensor (PUT)
router.put("/api/v1/sensors/:id", verifyCompanyApiKey, (req, res) => {
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
    "UPDATE Sensor SET location_id = ?, sensor_name = ?, sensor_category = ?, sensor_meta = ?, sensor_api_key = ? WHERE id = ? AND location_id IN (SELECT id FROM Location WHERE company_id = ?)",
    [
      location_id,
      sensor_name,
      sensor_category,
      sensor_meta,
      sensor_api_key,
      id,
      req.companyId,
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
router.delete("/api/v1/sensors/:id", verifyCompanyApiKey, (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM Sensor WHERE id = ? AND location_id IN (SELECT id FROM Location WHERE company_id = ?)",
    [id, req.companyId],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      res.status(200).json({ message: "Sensor deleted" });
    }
  );
});
// Agregar datos a un sensor (POST)
router.post("/api/v1/sensor_data", (req, res) => {
  console.log("Received sensor data:", req.body);
  const { sensor_id, json_data, timestamp, sensor_api_key } = req.body;

  if (!sensor_id || !json_data || !timestamp || !sensor_api_key) {
    return res.status(400).json({ error: "Missing required body parameters" });
  }

  // Verificar que la API key del sensor es válida
  db.query(
    "SELECT id FROM Sensor WHERE id = ? AND sensor_api_key = ?",
    [sensor_id, sensor_api_key],
    (err, results) => {
      if (err) {
        console.error("Database error on sensor lookup:", err.message);
        return res
          .status(500)
          .json({ error: "Database error", message: err.message });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid sensor API key" });
      }

      // Insertar los datos del sensor
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
    }
  );
});

module.exports = router;

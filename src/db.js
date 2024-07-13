const mysql = require("mysql2");

// Configura la conexión a la base de datos MySQL
const dbConfig = {
  host:
    process.env.DB_HOST ||
    "brewqhxqh7liisxjkcnv-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uaggkm25uglyiq0m",
  password: process.env.DB_PASSWORD || "P1llZrGf7o324OyV9sLs",
  database: process.env.DB_NAME || "brewqhxqh7liisxjkcnv",
  waitForConnections: true,
  connectionLimit: 2, // Reduce this to a lower number to prevent exceeding limits
  queueLimit: 0,
};

let db;

function handleDisconnect() {
  db = mysql.createPool(dbConfig);

  db.getConnection((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      setTimeout(handleDisconnect, 2000); // Reconnect after 2 seconds
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  db.on("error", (err) => {
    console.error("Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnect if connection is lost
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// Crea las tablas si no existen
const createTables = () => {
  db.query(
    `
    CREATE TABLE IF NOT EXISTS Admin (
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating Admin table:", err);
      }
    }
  );

  db.query(
    `
    CREATE TABLE IF NOT EXISTS Location (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      location_name VARCHAR(255),
      location_country VARCHAR(255),
      location_city VARCHAR(255),
      location_meta TEXT
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating Location table:", err);
      }
    }
  );

  db.query(
    `
    CREATE TABLE IF NOT EXISTS Company (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255),
      company_api_key VARCHAR(255)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating Company table:", err);
      }
    }
  );

  db.query(
    `
    CREATE TABLE IF NOT EXISTS Sensor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      location_id INT,
      sensor_name VARCHAR(255),
      sensor_category VARCHAR(255),
      sensor_meta TEXT,
      sensor_api_key VARCHAR(255)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating Sensor table:", err);
      }
    }
  );

  db.query(
    `
    CREATE TABLE IF NOT EXISTS SensorData (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sensor_id INT,
      json_data JSON,
      timestamp INT
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating SensorData table:", err);
      }
    }
  );

  // Uncomment and modify these queries as needed to insert example data
  // db.query(`
  //   INSERT INTO Company (company_name, company_api_key)
  //   VALUES ('Company A', 'company_a_key'), ('Company B', 'company_b_key')
  //   ON DUPLICATE KEY UPDATE company_name=VALUES(company_name)
  // `, (err) => {
  //   if (err) {
  //     console.error("Error inserting example data into Company table:", err);
  //   }
  // });

  // db.query(`
  //   INSERT INTO Sensor (company_id, location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key)
  //   VALUES
  //     (1, 1, 'Temperature Sensor', 'Temperature', 'Meta', 'temp_sensor_key'),
  //     (1, 1, 'Humidity Sensor', 'Humidity', 'Meta', 'hum_sensor_key'),
  //     (2, 2, 'Pressure Sensor', 'Pressure', 'Meta', 'press_sensor_key')
  //   ON DUPLICATE KEY UPDATE sensor_name=VALUES(sensor_name)
  // `, (err) => {
  //   if (err) {
  //     console.error("Error inserting example data into Sensor table:", err);
  //   }
  // });
};

createTables();

module.exports = db;

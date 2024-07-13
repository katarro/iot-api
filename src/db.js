const mysql = require("mysql2");

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host:
    process.env.DB_HOST ||
    "brewqhxqh7liisxjkcnv-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uaggkm25uglyiq0m",
  password: process.env.DB_PASSWORD || "P1llZrGf7o324OyV9sLs",
  database: process.env.DB_NAME || "brewqhxqh7liisxjkcnv",
});

// Conecta a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Crea las tablas si no existen
const createTables = () => {
  db.query(`
    CREATE TABLE IF NOT EXISTS Admin (
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS Location (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      location_name VARCHAR(255),
      location_country VARCHAR(255),
      location_city VARCHAR(255),
      location_meta TEXT
    )
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS Company (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255),
      company_api_key VARCHAR(255)
    )
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS Sensor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      location_id INT,
      sensor_name VARCHAR(255),
      sensor_category VARCHAR(255),
      sensor_meta TEXT,
      sensor_api_key VARCHAR(255)
    )
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS SensorData (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sensor_id INT,
      json_data JSON,
      timestamp INT
    )
  `);
  // Insertar datos de ejemplo
  // db.query(`
  //   INSERT INTO Company (company_name, company_api_key)
  //   VALUES ('Company A', 'company_a_key'), ('Company B', 'company_b_key')
  //   ON DUPLICATE KEY UPDATE company_name=VALUES(company_name)
  // `);

  // db.query(`
  //   INSERT INTO Sensor (company_id, location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key)
  //   VALUES
  //     (1, 1, 'Temperature Sensor', 'Temperature', 'Meta', 'temp_sensor_key'),
  //     (1, 1, 'Humidity Sensor', 'Humidity', 'Meta', 'hum_sensor_key'),
  //     (2, 2, 'Pressure Sensor', 'Pressure', 'Meta', 'press_sensor_key')
  //   ON DUPLICATE KEY UPDATE sensor_name=VALUES(sensor_name)
  // `);
};

createTables();

module.exports = db;

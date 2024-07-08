const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS Admin (username TEXT, password TEXT)");
  db.run(
    "CREATE TABLE IF NOT EXISTS Location (id INTEGER PRIMARY KEY, company_id INTEGER, location_name TEXT, location_country TEXT, location_city TEXT, location_meta TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Company (id INTEGER PRIMARY KEY, company_name TEXT, company_api_key TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Sensor (id INTEGER PRIMARY KEY, company_id INTEGER, location_id INTEGER, sensor_name TEXT, sensor_category TEXT, sensor_meta TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS SensorData (id INTEGER PRIMARY KEY, sensor_id INTEGER, json_data TEXT, timestamp INTEGER)"
  );

  // Insert sample data
  db.run(
    "INSERT INTO Company (company_name, company_api_key) VALUES ('Company A', 'company_a_key')"
  );
  db.run(
    "INSERT INTO Company (company_name, company_api_key) VALUES ('Company B', 'company_b_key')"
  );

  db.run(
    "INSERT INTO Sensor (company_id, location_id, sensor_name, sensor_category, sensor_meta) VALUES (1, 1, 'Temperature Sensor', 'Temperature', 'Meta')"
  );
  db.run(
    "INSERT INTO Sensor (company_id, location_id, sensor_name, sensor_category, sensor_meta) VALUES (1, 1, 'Humidity Sensor', 'Humidity', 'Meta')"
  );
  db.run(
    "INSERT INTO Sensor (company_id, location_id, sensor_name, sensor_category, sensor_meta) VALUES (2, 2, 'Pressure Sensor', 'Pressure', 'Meta')"
  );
});

module.exports = db;

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run("CREATE TABLE Admin (username TEXT, password TEXT)");
  db.run(
    "CREATE TABLE Company (id INTEGER PRIMARY KEY, company_name TEXT, company_api_key TEXT)"
  );
  db.run(
    "CREATE TABLE Location (id INTEGER PRIMARY KEY, company_id INTEGER, location_name TEXT, location_country TEXT, location_city TEXT, location_meta TEXT)"
  );
  db.run(
    "CREATE TABLE Sensor (id INTEGER PRIMARY KEY, location_id INTEGER, sensor_name TEXT, sensor_category TEXT, sensor_meta TEXT, sensor_api_key TEXT)"
  );
  db.run(
    "CREATE TABLE SensorData (id INTEGER PRIMARY KEY, sensor_id INTEGER, json_data TEXT, timestamp INTEGER)"
  );
});

module.exports = db;

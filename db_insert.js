const mysql = require("mysql2");

// Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: "brewqhxqh7liisxjkcnv-mysql.services.clever-cloud.com",
  user: "uaggkm25uglyiq0m",
  password: "P1llZrGf7o324OyV9sLs",
  database: "brewqhxqh7liisxjkcnv",
  port: 3306,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");

  // Eliminar datos de la tabla Location con id >= 5
  const deleteQuery = `DELETE FROM Location WHERE id >= 5`;

  db.query(deleteQuery, (err, results) => {
    if (err) {
      console.error("Error deleting data:", err);
      return;
    }
    console.log("Data deleted successfully:", results);
  });
});

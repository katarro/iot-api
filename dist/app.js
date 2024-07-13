const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); // Asegúrate de importar el módulo path
const routes = require("./routes");

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'index.html'));
});

app.use(routes);
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
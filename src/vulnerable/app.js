const express = require('express');
const app = express();

// Permite que la API lea cuerpos de peticiones en formato JSON
app.use(express.json());

// Importar las rutas de cada integrante
const rutasHans = require('./routes/rutas_hans');
const rutasComp1 = require('./routes/rutas_comp1');
const rutasComp2 = require('./routes/rutas_comp2');

// Conectar las rutas a la aplicación
app.use(rutasHans);
app.use(rutasComp1);
app.use(rutasComp2);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor MediCare Inseguro corriendo en http://localhost:${PORT}`);
});
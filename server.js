require("dotenv").config();
const express = require("express");
const cors = require("cors");

const catalogRoutes = require("./routes/catalogRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", catalogRoutes);

app.listen(PORT, () => {
	console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const db = require("./conexion"); // Asegúrate de que este archivo es tu conexión a MySQL

// Insertar una nueva rúbrica
router.post("/insertRubrica", (req, res) => {
    const { tipoEvaluacion } = req.body;

    if (!tipoEvaluacion) {
        return res.status(400).json({ error: "El tipo de evaluación es requerido" });
    }

    const query = "INSERT INTO tbRubrica (nombre_Rubrica, id_TipoEvaluacion) VALUES (?, ?)";
    const values = [tipoEvaluacion, tipoEvaluacion === "Rúbrica" ? 2 : 1];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al insertar la rúbrica:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        res.json({ message: "Rúbrica creada exitosamente", id: result.insertId });
    });
});

module.exports = router;
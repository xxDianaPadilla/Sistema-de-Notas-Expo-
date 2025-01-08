const express = require('express');
const DBConnection = require('./js/claseConexion');
const app = express();
const PORT = 5501;
const cors = require('cors');
app.use(cors());

app.use(express.static('pages'));
app.use(express.static('styles'));
app.use(express.static('img'));
app.use(express.static('js'));

app.get('/usuarios-conectados', async (req, res ) => {
    const db = new DBConnection();
    try{
        const query = `
            SELECT 
                tbUsuario.Nombre_Usuario AS Nombre,
                tbUsuario.Apellido_Usuario AS Apellido,
                tbRol.nombreRol AS Rol,
                tbUsuario.FechaHora_Conexion AS FechaConexion
            FROM
                tbUsuario
            INNER JOIN
                tbRol
            ON
                tbUsuario.Id_Rol = tbRol.Id_Rol
            ORDER BY
                tbUsuario.FechaHora_Conexion DESC
        `;
        const usuarios = await db.query(query);
        res.json(usuarios);
    }catch(err){
        console.error('Error obteniendo usuarios conectados:', err.message);
        res.status(500).send('Error del servidor');
    }finally{
        db.close();
    }
});

app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
const express = require('express');
const DBConnection = require('./js/claseConexion');
const app = express();
const PORT = 5501;
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('pages'));
app.use(express.static('styles'));
app.use(express.static('img'));
app.use(express.static('js'));
app.use(express.static('pages/formsUsers'));

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

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

app.get('/etapas', async (req, res) => {
    const db = new DBConnection();
    try{
        const query = `
            SELECT 
                id_etapa,
                porcentaje_etapa,
                fecha_fin
            FROM 
                tbEtapa
            ORDER BY fecha_fin ASC
        `;
        const etapas = await db.query(query);
        res.json(etapas);
    }catch(err){
        console.error('Error obteniendo las etapas: ', err.message);
        res.status(500).send('Error del servidor');
    }finally{
        db.close();
    }
});

app.get('/actividades', async(req, res) =>{
    const db = new DBConnection();
    try{
        const query = `
            SELECT 
                Id_Actividad,
                Titulo_Actividad,
                Fecha_Inicio,
                Fecha_Fin
            FROM 
                tbActividad
        `;
        const actividades = await db.query(query);
        res.json(actividades);
    }catch(err){
        console.error('Error obteniendo las actividades:', err.message);
        res.status(500).send('Error del servidor');
    }finally{
        db.close();
    }
});

app.delete('/actividades/:id', async (req, res) =>{
    const db = new DBConnection();
    console.log('Datos recibidos:', req.body);
    const { id } = req.params;
    try{
        await db.query('DELETE FROM tbActividad WHERE Id_Actividad = ?', [id]);
        res.status(200).json({message: 'Actividad eliminada correctamente'});
    }catch (error){
        res.status(500).json({message: 'Error al eliminar la actividad', error});
    }
});

app.put('/actividades/:id', async (req, res) =>{
    const db = new DBConnection();
    const { id } = req.params;
    const { Titulo_Actividad, Fecha_Inicio, Fecha_Fin} = req.body;

    if (!Titulo_Actividad || !Fecha_Inicio || !Fecha_Fin) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud' });
    }

    try{
        await db.query('UPDATE tbActividad SET Titulo_Actividad = ?, Fecha_Inicio = ?, Fecha_Fin = ? WHERE Id_Actividad = ?',
        [Titulo_Actividad, Fecha_Inicio, Fecha_Fin, id]);

        const actividadActualizada = {
            Id_Actividad: id,
            Titulo_Actividad,
            Fecha_Inicio,
            Fecha_Fin
        };


        res.status(200).json(actividadActualizada);
    }catch(error){
        res.status(500).json({message: 'Error al actualizar la actividad', error});
    }
});

app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
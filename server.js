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
                fecha_inicio,
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

app.post('/actividades', async (req, res) =>{
    const db = new DBConnection();
    const { Titulo_Actividad, Fecha_Inicio, Fecha_Fin } = req.body;

    if (!Titulo_Actividad || !Fecha_Inicio || !Fecha_Fin) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }

    try{
        const query = `INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES (?, ?, ?)`;

        await db.query(query, [Titulo_Actividad, Fecha_Inicio, Fecha_Fin]);
        res.status(201).json({message: 'Actividad agregada exitosamente'});
    }catch(err){
        console.error('Error al insertar actividad:', err.message);
        res.status(500).send('Error del servidor');
    }finally{
        db.close();
    }
});

app.put('/etapas/:id', async (req, res) =>{
    const db = new DBConnection();
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.body;

    if(!fecha_inicio || !fecha_fin){
        return res.status(400).json({message: 'Faltan datos en la solicitud'});
    }

    try{
        await db.query('UPDATE tbEtapa SET fecha_inicio = ?, fecha_fin = ? WHERE id_etapa = ?', [fecha_inicio, fecha_fin, id]);

        res.status(200).json({message: 'Etapa actualizada correctamente'});
    }catch(error){
        console.error('Error al actualizar la etapa:', error.message);
        res.status(500).json({message: 'Error del servidor'});
    }finally{
        db.close();
    }
});

app.get('/etapa-actual', async (req, res) =>{
    const db = new DBConnection();
    const fechaHoy = new Date().toISOString().split('T')[0];

    try{
        const query = `
            SELECT 
                id_etapa,
                porcentaje_etapa
            FROM 
                tbEtapa
            WHERE 
                fecha_inicio <= ? AND fecha_fin >= ?
        `;
        const [etapaActual] = await db.query(query, [fechaHoy, fechaHoy]);
        if(etapaActual){
            res.json(etapaActual);
        }else{
            res.json({porcentaje_etapa: 'Sin etapa activa'});
        }
    }catch (err){
        console.error('Error obteniendo la etapa actual:', err.message);
        res.status(500).send('Error del servidor');
    }finally{
        db.close();
    }
});

app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
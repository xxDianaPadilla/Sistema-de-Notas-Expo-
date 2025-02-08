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

        const checkQuery = `
            SELECT Titulo_Actividad, Fecha_Inicio, Fecha_Fin
            FROM tbActividad
            WHERE 
                Id_Actividad != ? AND
                ((? BETWEEN Fecha_Inicio AND Fecha_Fin) 
                OR (? BETWEEN Fecha_Inicio AND Fecha_Fin) 
                OR (Fecha_Inicio BETWEEN ? AND ?) 
                OR (Fecha_Fin BETWEEN ? AND ?))
        `;

        const conflicts = await db.query(checkQuery, [id, Fecha_Inicio, Fecha_Fin, Fecha_Inicio, Fecha_Fin, Fecha_Inicio, Fecha_Fin]);

        if(conflicts.length > 0){
            let conflictMessages = conflicts.map(conflict => {
                let conflictDate = "";
                if(Fecha_Inicio >= conflict.Fecha_Inicio && Fecha_Inicio <= conflict.Fecha_Fin){
                    conflictDate = `Inicio: ${Fecha_Inicio}`;
                }
                if(Fecha_Fin >= conflict.Fecha_Inicio && Fecha_Fin <= conflict.Fecha_Fin){
                    conflictDate += (conflictDate ? " y " : "" ) +  `Fin: ${Fecha_Fin}`;
                }

                return `Conflicto de fechas con "${conflict.Titulo_Actividad}".`;
            });

            return res.status(400).json({message: conflictMessages.join(". ")});
        }

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

        const checkQuery = `
            SELECT Titulo_Actividad, Fecha_Inicio, Fecha_Fin
            FROM tbActividad
            WHERE (? BETWEEN Fecha_Inicio AND Fecha_Fin) 
            OR (? BETWEEN Fecha_Inicio AND Fecha_Fin) 
            OR (Fecha_Inicio BETWEEN ? AND ?) 
            OR (Fecha_Fin BETWEEN ? AND ?)
        `;

        const conflicts = await db.query(checkQuery, [Fecha_Inicio, Fecha_Fin, Fecha_Inicio, Fecha_Fin, Fecha_Inicio, Fecha_Fin]);

        if (conflicts.length > 0) {
            let conflictMessages = conflicts.map(conflict => {
                let conflictDate = "";
                if (Fecha_Inicio >= conflict.Fecha_Inicio && Fecha_Inicio <= conflict.Fecha_Fin) {
                    conflictDate = `Inicio: ${Fecha_Inicio}`;
                }
                if (Fecha_Fin >= conflict.Fecha_Inicio && Fecha_Fin <= conflict.Fecha_Fin) {
                    conflictDate += (conflictDate ? " y " : "") + `Fin: ${Fecha_Fin}`;
                }
                return `Conflicto de fechas con "${conflict.Titulo_Actividad}".`;
            });

            return res.status(400).json({ message: conflictMessages.join(". ") });
        }

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

        const checkQuery = `
            SELECT id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin
            FROM tbEtapa
            WHERE 
                id_etapa != ? AND
                ((? BETWEEN fecha_inicio AND fecha_fin) 
                OR (? BETWEEN fecha_inicio AND fecha_fin) 
                OR (fecha_inicio BETWEEN ? AND ?) 
                OR (fecha_fin BETWEEN ? AND ?))
        `;

        const conflicts = await db.query(checkQuery, [id, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin]);

        let conflictMessages = [];

        if (conflicts.length > 0) {
            conflictMessages = conflicts.map(conflict => {
                let conflictDate = "";
                if (fecha_inicio >= conflict.fecha_inicio && fecha_inicio <= conflict.fecha_fin) {
                    conflictDate = `Inicio: ${fecha_inicio}`;
                }
                if (fecha_fin >= conflict.fecha_inicio && fecha_fin <= conflict.fecha_fin) {
                    conflictDate += (conflictDate ? " y " : "") + `Fin: ${fecha_fin}`;
                }
                return `Conflicto de fechas con la etapa del: ${conflict.porcentaje_etapa}.`;
            });

            return res.status(400).json({ message: conflictMessages.join(". ") });
        }
        
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

app.get('/proyectos', (req, res) =>{
    const db = new DBConnection();
    const query = `
        SELECT 
            tbProyectos.id_nivel AS Id_Nivel,  
            tbProyectos.nombre_Proyecto AS Nombre_Proyecto,
            tbProyectos.link_google_sites AS Google_Sites,
            tbEstadoProyectos.tipo_estado AS Estado
        FROM
            tbProyectos
        INNER JOIN
            tbEstadoProyectos
        ON
            tbProyectos.id_estado = tbEstadoProyectos.id_estado
    `;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error ejecutando la consulta: ', err);
            res.status(500).json({error: 'Error obteniemdo los proyectos'});
            return;
        }

        const proyectos = {
            tercerCiclo: results.filter(p => p.Id_Nivel && p.Id_Nivel >= 1 && p.Id_Nivel <= 3),
            bachillerato: results.filter(p => p.Id_Nivel && p.Id_Nivel >= 4 && p.Id_Nivel <= 6)
        };

        res.json(proyectos);
    });
});

app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
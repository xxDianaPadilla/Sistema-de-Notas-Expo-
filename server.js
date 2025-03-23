// Importando las dependencias necesarias
const express = require('express'); // Framework para crear servidores web en Node.js
const DBConnection = require('./js/claseConexion'); // Clase para manejar la conexión con la base de datos
const app = express(); // Creando una instancia de Express
const PORT = 5501; // Definiendo el puerto en el que correrá el servidor
const cors = require('cors'); // Middleware para permitir solicitudes desde otros dominios

// Configurando de middlewares
app.use(cors()); // Habilitando CORS para permitir conexiones desde otros dominios
app.use(express.json()); // Habilitando el uso de JSON en las solicitudes
app.use(express.urlencoded({ extended: true })); // Habilitando el procesamiento de formularios URL-encoded

// Configuración de archivos estáticos (frontend)
app.use(express.static('pages'));
app.use(express.static('styles'));
app.use(express.static('img'));
app.use(express.static('js'));
app.use('/formsUsers', express.static('pages/formsUsers'));

// Ruta para servir la página principal
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

// Endpoint para obtener la lista de usuarios conectados (Un select)
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

// Endpoint para obtener las etapas (Un select)
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

// Endpoint para obtener actividades (Un select)
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

// Endpoint para eliminar una actividad por ID
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

// Endpoint para actualizar una actividad por ID
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

// Endpoint para agregar una nueva actividad 
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

// Endpoint para actualizar las etapas por ID
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

// Endpoint para obtener la etapa actual según la fecha
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

// Endpoint para obtener los proyectos existentes
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

app.get('/niveles', (req, res) =>{
    const db = new DBConnection();
    const query = `SELECT Id_Nivel, Nombre_Nivel, letra_nivel FROM tbNivel`;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo los niveles:', err);
            res.status(500).json({error: 'Error obteniendo los niveles'});
            return;
        }
        res.json(results);
    });
});

app.get('/seccionGrupo', (req, res) =>{
    const db = new DBConnection();
    const query = `SELECT Id_SeccionGrupo, Nombre_SeccionGrupo FROM tbSeccionGrupo`;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo las secciones y grupos:', err);
            res.status(500).json({error: 'Error obteniendo las secciones y grupos'});
            return;
        }
        res.json(results);
    });
});

app.get('/especialidad', (req, res) =>{
    const db = new DBConnection();
    const query = `SELECT Id_Especialidad, Nombre_Especialidad, letra_especialidad FROM tbEspecialidad`;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo las especialidades:', err);
            res.status(500).json({error: 'Error obteniendo las especialidades'});
            return;
        }
        res.json(results);
    });
});

app.get('/proyectosId', (req, res) =>{
    const prefijo = req.query.prefijo;

    if(!prefijo){
        return res.status(400).json({error: 'Se requiere un prefijo para la búsqueda de proyectos'});
    }

    const db = new DBConnection();
    const query = `SELECT id_Proyecto FROM tbProyectos WHERE id_Proyecto LIKE '${prefijo}%'`;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo los proyectos:', err);
            res.status(500).json({error: 'Error obteniendo los proyectos'});
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes', (req, res) =>{
    const db = new DBConnection();
    const query = `
        SELECT 
            id_Estudiante, 
            Codigo_Carnet, 
            nombre_Estudiante, 
            apellido_Estudiante, 
            Id_Nivel, 
            Id_SeccionGrupo, 
            Id_Especialidad,
            id_Proyecto
        FROM 
            tbEstudiantes
        ORDER BY 
            Id_Nivel, 
            apellido_Estudiante, 
            nombre_Estudiante
    `;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo los estudiantes:', err);
            res.status(500).json({error: 'Error obteniendo los estudiantes'});
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes/nivel/:nivelId', (req, res) =>{
    const nivelId = req.params.nivelId;

    if(!nivelId){
        return res.status(400).json({error: 'Se requiere un ID de nivel'});
    }

    const db = new DBConnection();
    const query = `
        SELECT 
            id_Estudiante, 
            Codigo_Carnet, 
            nombre_Estudiante, 
            apellido_Estudiante, 
            Id_Nivel, 
            Id_SeccionGrupo, 
            Id_Especialidad,
            id_Proyecto
        FROM 
            tbEstudiantes
        WHERE 
            Id_Nivel = ?
        ORDER BY 
            apellido_Estudiante, 
            nombre_Estudiante
    `;

    db.query(query, [nivelId], (err, results) =>{
        if(err){
            console.error('Error obteniendo los estudiantes por nivel:', err);
            res.status(500).json({error: 'Error obteniendo los estudiantes por nivel'});
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes/disponibles', (req, res) =>{
    const db = new DBConnection();
    const query = `
        SELECT 
            id_Estudiante, 
            Codigo_Carnet, 
            nombre_Estudiante, 
            apellido_Estudiante, 
            Id_Nivel, 
            Id_SeccionGrupo, 
            Id_Especialidad,
            id_Proyecto
        FROM 
            tbEstudiantes
        WHERE 
            id_Proyecto IS NULL
        ORDER BY 
            Id_Nivel, 
            apellido_Estudiante, 
            nombre_Estudiante
    `;

    db.query(query, (err, results) =>{
        if(err){
            console.error('Error obteniendo los estudiantes disponibles:', err);
            res.status(500).json({error: 'Error obteniendo los estudiantes disponibles'});
            return;
        }
        res.json(results);
    });
});

app.post('/proyectos/asignar-estudiantes', (req, res) =>{
    const {proyectoId, estudiantesIds} = req.body;

    if(!proyectoId || !estudiantesIds || !Array.isArray(estudiantesIds) || estudiantesIds.length === 0){
        return res.status(400).json({error: 'Se requiere un ID de proyecto y al menos un ID de estudiante'});
    }

    const db = new DBConnection();

    const placeholders = estudiantesIds.map(() => '?').join(',');
    const query = `
        UPDATE tbEstudiantes
        SET id_Proyecto = ?
        WHERE id_Estudiante IN (${placeholders})
        AND id_Proyecto IS NULL
    `;

    const params = [proyectoId, ...estudiantesIds];

    db.query(query, params, (err, results) =>{
        if(err){
            console.error('Error asignando estudiantes al proyecto:', err);
            res.status(500).json({error: 'Error asignando estudiantes al proyecto'});
            return;
        }

        res.json({
            success: true,
            message: `${results.affectedRows} estudiantes asignados al proyecto ${proyectoId}`,
            affectedRows: results.affectedRows
        });
    });
});

// Servidor escuchando en el puerto definido
app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
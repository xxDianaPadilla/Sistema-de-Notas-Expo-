// Importando las dependencias necesarias
const express = require('express'); // Framework para crear servidores web en Node.js
const DBConnection = require('./js/claseConexion'); // Clase para manejar la conexión con la base de datos
const app = express(); // Creando una instancia de Express
const PORT = 5501; // Definiendo el puerto en el que correrá el servidor
const cors = require('cors'); // Middleware para permitir solicitudes desde otros dominios

const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Para manejar JWT
const cookieParser = require('cookie-parser'); // Para manejar cookies
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.xlsx' && ext !== '.xls') {
            return cb(new Error('Solo se permiten archivos Excel (xlsx o .xls)'));
        }
        cb(null, true);
    }
});

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

app.get('/escala', (req, res) => {
    res.sendFile(__dirname + '/pages/escala.html'); // Página de Escala estimativa
});

app.get('/newRubric', (req, res) => {
    res.sendFile(__dirname + '/pages/newRubric.html');
});

// Endpoint para obtener la lista de usuarios conectados (Un select)
app.get('/usuarios-conectados', async (req, res) => {
    const db = new DBConnection();
    try {
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
    } catch (err) {
        console.error('Error obteniendo usuarios conectados:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para obtener las etapas (Un select)
app.get('/etapas', async (req, res) => {
    const db = new DBConnection();
    try {
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
    } catch (err) {
        console.error('Error obteniendo las etapas: ', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para obtener actividades (Un select)
app.get('/actividades', async (req, res) => {
    const db = new DBConnection();
    try {
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
    } catch (err) {
        console.error('Error obteniendo las actividades:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para eliminar una actividad por ID
app.delete('/actividades/:id', async (req, res) => {
    const db = new DBConnection();
    console.log('Datos recibidos:', req.body);
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tbActividad WHERE Id_Actividad = ?', [id]);
        res.status(200).json({ message: 'Actividad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la actividad', error });
    }
});

// Endpoint para actualizar una actividad por ID
app.put('/actividades/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;
    const { Titulo_Actividad, Fecha_Inicio, Fecha_Fin } = req.body;

    if (!Titulo_Actividad || !Fecha_Inicio || !Fecha_Fin) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud' });
    }

    try {

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

        await db.query('UPDATE tbActividad SET Titulo_Actividad = ?, Fecha_Inicio = ?, Fecha_Fin = ? WHERE Id_Actividad = ?',
            [Titulo_Actividad, Fecha_Inicio, Fecha_Fin, id]);

        const actividadActualizada = {
            Id_Actividad: id,
            Titulo_Actividad,
            Fecha_Inicio,
            Fecha_Fin
        };


        res.status(200).json(actividadActualizada);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la actividad', error });
    }
});

// Endpoint para agregar una nueva actividad 
app.post('/actividades', async (req, res) => {
    const db = new DBConnection();
    const { Titulo_Actividad, Fecha_Inicio, Fecha_Fin } = req.body;

    if (!Titulo_Actividad || !Fecha_Inicio || !Fecha_Fin) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {

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
        res.status(201).json({ message: 'Actividad agregada exitosamente' });
    } catch (err) {
        console.error('Error al insertar actividad:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para actualizar las etapas por ID
app.put('/etapas/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.body;

    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud' });
    }

    try {

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

        res.status(200).json({ message: 'Etapa actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la etapa:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

// Endpoint para obtener la etapa actual según la fecha
app.get('/etapa-actual', async (req, res) => {
    const db = new DBConnection();
    const fechaHoy = new Date().toISOString().split('T')[0];

    try {
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
        if (etapaActual) {
            res.json(etapaActual);
        } else {
            res.json({ porcentaje_etapa: 'Sin etapa activa' });
        }
    } catch (err) {
        console.error('Error obteniendo la etapa actual:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para obtener los proyectos existentes
app.get('/proyectos', (req, res) => {
    const db = new DBConnection();
    const query = `
        SELECT 
            tbProyectos.id_Proyecto AS IdProyecto,
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

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta: ', err);
            res.status(500).json({ error: 'Error obteniemdo los proyectos' });
            return;
        }

        const proyectos = {
            tercerCiclo: results.filter(p => p.Id_Nivel && p.Id_Nivel >= 1 && p.Id_Nivel <= 3),
            bachillerato: results.filter(p => p.Id_Nivel && p.Id_Nivel >= 4 && p.Id_Nivel <= 6)
        };

        res.json(proyectos);
    });
});

app.get('/niveles', (req, res) => {
    const db = new DBConnection();
    const query = 'SELECT Id_Nivel, Nombre_Nivel, letra_nivel FROM tbNivel';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo los niveles:', err);
            res.status(500).json({ error: 'Error obteniendo los niveles' });
            return;
        }
        res.json(results);
    });
});

app.get('/seccionGrupo', (req, res) => {
    const db = new DBConnection();
    const query = `SELECT Id_SeccionGrupo, Nombre_SeccionGrupo FROM tbSeccionGrupo`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo las secciones y grupos:', err);
            res.status(500).json({ error: 'Error obteniendo las secciones y grupos' });
            return;
        }
        res.json(results);
    });
});

app.get('/especialidad', (req, res) => {
    const db = new DBConnection();
    const query = `SELECT Id_Especialidad, Nombre_Especialidad, letra_especialidad FROM tbEspecialidad`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo las especialidades:', err);
            res.status(500).json({ error: 'Error obteniendo las especialidades' });
            return;
        }
        res.json(results);
    });
});

app.get('/proyectosId', (req, res) => {
    const prefijo = req.query.prefijo;

    if (!prefijo) {
        return res.status(400).json({ error: 'Se requiere un prefijo para la búsqueda de proyectos' });
    }

    const db = new DBConnection();
    const query = `SELECT id_Proyecto FROM tbProyectos WHERE id_Proyecto LIKE '${prefijo}%'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo los proyectos:', err);
            res.status(500).json({ error: 'Error obteniendo los proyectos' });
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes', (req, res) => {
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

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo los estudiantes:', err);
            res.status(500).json({ error: 'Error obteniendo los estudiantes' });
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes/nivel/:nivelId', (req, res) => {
    const nivelId = req.params.nivelId;

    if (!nivelId) {
        return res.status(400).json({ error: 'Se requiere un ID de nivel' });
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

    db.query(query, [nivelId], (err, results) => {
        if (err) {
            console.error('Error obteniendo los estudiantes por nivel:', err);
            res.status(500).json({ error: 'Error obteniendo los estudiantes por nivel' });
            return;
        }
        res.json(results);
    });
});

app.get('/estudiantes/disponibles', (req, res) => {
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

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo los estudiantes disponibles:', err);
            res.status(500).json({ error: 'Error obteniendo los estudiantes disponibles' });
            return;
        }
        res.json(results);
    });
});

app.post('/proyectos/asignar-estudiantes', (req, res) => {
    const { proyectoId, estudiantesIds } = req.body;

    if (!proyectoId || !estudiantesIds || !Array.isArray(estudiantesIds) || estudiantesIds.length === 0) {
        return res.status(400).json({ error: 'Se requiere un ID de proyecto y al menos un ID de estudiante' });
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

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error asignando estudiantes al proyecto:', err);
            res.status(500).json({ error: 'Error asignando estudiantes al proyecto' });
            return;
        }

        res.json({
            success: true,
            message: `${results.affectedRows} estudiantes asignados al proyecto ${proyectoId}`,
            affectedRows: results.affectedRows
        });
    });
});

app.post('/creacionProyectos', async (req, res) => {
    const { nombre, nivelId, seccionId, especialidadId, idProyecto, estado, estudiantesIds } = req.body;

    console.log('Datos recibidos:', {
        nombre, nivelId, seccionId, especialidadId,
        idProyecto, estado,
        estudiantesIds: estudiantesIds ? JSON.stringify(estudiantesIds) : 'null'
    });

    if (!nombre || !nivelId || !seccionId || !idProyecto) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (!estudiantesIds || !Array.isArray(estudiantesIds)) {
        return res.status(400).json({ error: 'El formato de estudiantesIds es incorrecto' });
    }

    const db = new DBConnection();

    try {
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        const id_estado = estado ? 1 : 2;
        const valorGoogle = `https://sites.google.com/ricaldone.edu.sv/${idProyecto}`;

        const insertProyectoQuery = `
            INSERT INTO tbProyectos 
            (id_Proyecto, nombre_Proyecto, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_estado, link_google_sites)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(
            insertProyectoQuery,
            [idProyecto, nombre, nivelId, seccionId, especialidadId || null, id_estado, valorGoogle]
        );

        console.log('Proyecto insertado correctamente, ID proyecto:', idProyecto);

        if (estudiantesIds.length === 0) {
            await new Promise((resolve, reject) => {
                db.commit(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log('No hay estudiantes para asignar - Transacción completada');
            return res.status(201).json({
                success: true,
                message: 'Proyecto creado correctamente (sin estudiantes)',
                idProyecto: idProyecto,
                estudiantes: 0
            });
        }

        const placeholders = estudiantesIds.map(() => '?').join(',');
        const updateAllQuery = `
            UPDATE tbEstudiantes 
            SET id_Proyecto = ? 
            WHERE id_Estudiante IN (${placeholders})
        `;

        const updateParams = [idProyecto, ...estudiantesIds];

        const updateResult = await db.query(updateAllQuery, updateParams);

        await new Promise((resolve, reject) => {
            db.commit(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Actualizaciones completadas: ${updateResult.affectedRows}/${estudiantesIds.length}`);

        res.status(201).json({
            success: true,
            message: 'Proyecto creado correctamente',
            idProyecto: idProyecto,
            estudiantes: updateResult.affectedRows,
            errores: estudiantesIds.length - updateResult.affectedRows
        });

    } catch (error) {
        db.rollback(() => {
            console.error('Error en la transacción:', error);
            res.status(500).json({ error: 'Error al crear el proyecto: ' + error.message });
        });
    } finally {
        db.close();
    }
});

app.post('/crearRubrica', async (req, res) => {
    const { nombreRubrica, tipoEvaluacion, criterios } = req.body;

    console.log('Datos recibidos:', {
        nombreRubrica,
        tipoEvaluacion,
        criterios: criterios ? JSON.stringify(criterios) : 'null'
    });

    if (!nombreRubrica || !tipoEvaluacion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (!criterios || !Array.isArray(criterios)) {
        return res.status(400).json({ error: 'El formato de criterios es incorrecto' });
    }

    const db = new DBConnection();

    try {
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        const tipoEvaluacionId = tipoEvaluacion === 'Rúbrica' ? 2 : 1;

        const insertRubricaQuery = `
            INSERT INTO tbRubrica (nombre_Rubrica, id_TipoEvaluacion) 
            VALUES (?, ?)
        `;

        const result = await db.query(insertRubricaQuery, [nombreRubrica, tipoEvaluacionId]);
        const idRubrica = result.insertId;
        console.log('Rúbrica insertada correctamente, ID:', idRubrica);

        if (criterios.length === 0) {
            await new Promise((resolve, reject) => {
                db.commit(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log('No hay criterios para asignar - Transacción completada');
            return res.status(201).json({
                success: true,
                message: 'Rúbrica creada correctamente (sin criterios)',
                idRubrica,
                criterios: 0
            });
        }

        const insertCriterioQuery = `
            INSERT INTO tbCriterios (id_Rubrica, descripcion_Criterio, puntaje_Maximo)
            VALUES ${criterios.map(() => '(?, ?, ?)').join(',')}
        `;

        const criteriosParams = criterios.flatMap(criterio => [idRubrica, criterio.descripcion, criterio.puntaje]);
        const insertResult = await db.query(insertCriterioQuery, criteriosParams);

        await new Promise((resolve, reject) => {
            db.commit(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Criterios insertados: ${insertResult.affectedRows}/${criterios.length}`);

        res.status(201).json({
            success: true,
            message: 'Rúbrica creada correctamente',
            idRubrica,
            criterios: insertResult.affectedRows,
            errores: criterios.length - insertResult.affectedRows
        });
    } catch (error) {
        db.rollback(() => {
            console.error('Error en la transacción:', error);
            res.status(500).json({ error: 'Error al crear la rúbrica: ' + error.message });
        });
    } finally {
        db.close();
    }
});

app.get('/proyectos/:id', async (req, res) => {
    const idProyecto = req.params.id;

    console.log('Recibida petición para proyecto ID:', idProyecto);

    if (!idProyecto) {
        console.log('ID de proyecto no proporcionado');
        return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
    }

    const db = new DBConnection();
    const query = `
        SELECT 
            p.id_Proyecto AS idProyecto,
            p.nombre_Proyecto, 
            p.Id_Nivel, 
            p.Id_SeccionGrupo, 
            p.Id_Especialidad,
            p.link_google_sites AS Google_Sites,
            e.tipo_estado AS Estado
        FROM 
            tbProyectos p
        INNER JOIN 
            tbEstadoProyectos e ON p.id_estado = e.id_estado
        WHERE 
            p.id_Proyecto = ?
    `;

    console.log('Ejecutando consulta SQL:', query);
    console.log('Parámetros:', [idProyecto]);

    try {
        const results = await db.query(query, [idProyecto]);

        console.log('Resultados encontrados:', results.length);

        if (results.length === 0) {
            console.log('No se encontró ningún proyecto con ID:', idProyecto);
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        console.log('Devolviendo datos del proyecto:', results[0]);
        res.json({ proyecto: results[0] });
    } catch (err) {
        console.error('Error obteniendo el proyecto:', err);
        res.status(500).json({ error: 'Error obteniendo el proyecto', details: err.message });
    } finally {
        db.close();
    }
});

app.get('/proyectos/:id/estudiantes', (req, res) => {
    const idProyecto = req.params.id;

    if (!idProyecto) {
        return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
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
            id_Proyecto = ?
        ORDER BY 
            apellido_Estudiante, 
            nombre_Estudiante
    `;

    db.query(query, [idProyecto], (err, results) => {
        if (err) {
            console.error('Error obteniendo los estudiantes del proyecto:', err);
            res.status(500).json({ error: 'Error obteniendo los estudiantes del proyecto' });
            return;
        }

        res.json({ estudiantes: results });
    });
});

app.put('/actualizarProyecto', async (req, res) => {
    const { idProyecto, nombre, nivelId, seccionId, especialidadId, estado, estudiantesIds, originalProjectId } = req.body;

    console.log('Datos recibidos para actualización:', {
        idProyecto, originalProjectId, nombre, nivelId, seccionId, especialidadId,
        estado, estudiantesIds: estudiantesIds ? JSON.stringify(estudiantesIds) : 'null'
    });

    if (!idProyecto || !nombre || !nivelId || !seccionId) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (!estudiantesIds || !Array.isArray(estudiantesIds)) {
        return res.status(400).json({ error: 'El formato de estudiantesIds es incorrecto' });
    }

    const projectIdToUpdate = originalProjectId || idProyecto;

    const db = new DBConnection();

    try {
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        const id_estado = estado ? 1 : 2;
        const valorGoogle = `https://sites.google.com/ricaldone.edu.sv/${idProyecto}`;

        if (projectIdToUpdate !== idProyecto) {
            console.log(`ID del proyecto cambió: ${projectIdToUpdate} -> ${idProyecto}. Desvinculando estudiantes primero.`);

            const resetEstudiantesQuery = `
                UPDATE tbEstudiantes 
                SET id_Proyecto = NULL 
                WHERE id_Proyecto = ?
            `;

            await db.query(resetEstudiantesQuery, [projectIdToUpdate]);

            const deleteOldProjectQuery = `
                DELETE FROM tbProyectos
                WHERE id_Proyecto = ?
            `;

            await db.query(deleteOldProjectQuery, [projectIdToUpdate]);

            const insertProyectoQuery = `
                INSERT INTO tbProyectos
                (id_Proyecto, nombre_Proyecto, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_estado, link_google_sites)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await db.query(
                insertProyectoQuery,
                [idProyecto, nombre, nivelId, seccionId, especialidadId || null, id_estado, valorGoogle]
            );

            console.log('Proyecto recreado con nuevo ID:', idProyecto);
        } else {
            const updateProyectoQuery = `
                UPDATE tbProyectos 
                SET nombre_Proyecto = ?, 
                    link_google_sites = ?,
                    Id_Nivel = ?, 
                    Id_SeccionGrupo = ?, 
                    Id_Especialidad = ?, 
                    id_estado = ?
                WHERE id_Proyecto = ?
            `;

            await db.query(
                updateProyectoQuery,
                [nombre, valorGoogle, nivelId, seccionId, especialidadId || null, id_estado, idProyecto]
            );

            console.log('Proyecto actualizado correctamente, ID proyecto:', idProyecto);

            const resetEstudiantesQuery = `
                UPDATE tbEstudiantes 
                SET id_Proyecto = NULL 
                WHERE id_Proyecto = ?
            `;

            await db.query(resetEstudiantesQuery, [idProyecto]);
        }

        if (estudiantesIds.length > 0) {
            const placeholders = estudiantesIds.map(() => '?').join(',');
            const updateAllQuery = `
                UPDATE tbEstudiantes 
                SET id_Proyecto = ? 
                WHERE id_Estudiante IN (${placeholders})
            `;

            const updateParams = [idProyecto, ...estudiantesIds];
            const updateResult = await db.query(updateAllQuery, updateParams);

            await new Promise((resolve, reject) => {
                db.commit(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log(`Actualizaciones de estudiantes completadas: ${updateResult.affectedRows}/${estudiantesIds.length}`);

            res.status(200).json({
                success: true,
                message: 'Proyecto actualizado correctamente',
                idProyecto: idProyecto,
                estudiantes: updateResult.affectedRows,
                errores: estudiantesIds.length - updateResult.affectedRows
            });
        } else {
            await new Promise((resolve, reject) => {
                db.commit(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log('Proyecto actualizado sin estudiantes - Transacción completada');

            res.status(200).json({
                success: true,
                message: 'Proyecto actualizado correctamente (sin estudiantes)',
                idProyecto: idProyecto,
                estudiantes: 0
            });
        }
    } catch (error) {
        db.rollback(() => {
            console.error('Error en la transacción de actualización:', error);
            res.status(500).json({ error: 'Error al actualizar el proyecto: ' + error.message });
        });
    } finally {
        db.close();
    }
});

// Endpoint para agregar un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    const db = new DBConnection();
    const { nombre, apellido, correo, contraseña, idRol } = req.body;

    if (!nombre || !apellido || !correo || !contraseña || !idRol) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const query = `
            INSERT INTO tbUsuario (Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [nombre, apellido, correo, hashedPassword, idRol, new Date()];

        await db.query(query, values);
        res.status(201).json({ message: 'Usuario agregado exitosamente' });
    } catch (error) {
        console.error('Error al insertar usuario:', error.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Select Usuarios
app.get('/api/usuarios', async (req, res) => {
    const db = new DBConnection();
    const { rol } = req.query; // Obtener el rol de la consulta

    let query = 'SELECT * FROM tbUsuario';
    const values = [];

    if (rol) {
        query += ' WHERE Id_Rol = ?'; // Filtrar por rol
        values.push(rol);
    }

    try {
        const usuarios = await db.query(query, values);
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

//Delete

app.delete('/api/usuarios/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;

    try {
        await db.query('DELETE FROM tbUsuario WHERE Id_Usuario = ?', [id]);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para iniciar sesión y generar un JWT
app.post('/api/login', async (req, res) => {
    const db = new DBConnection();
    const { correo, contraseña } = req.body;

    try {
        const query = 'SELECT * FROM tbUsuario WHERE Correo_Usuario = ?';
        const [usuario] = await db.query(query, [correo]);

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Comparar la contraseña proporcionada con la almacenada
        const isMatch = await bcrypt.compare(contraseña, usuario.Contra_Usuario);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token JWT
        const token = jwt.sign({ id: usuario.Id_Usuario, rol: usuario.Id_Rol }, 'tu_secreto', { expiresIn: '1h' });

        // Establecer el token en una cookie
        res.cookie('token', token, { httpOnly: true, secure: true }); // Asegúrate de usar secure: true en producción

        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Middleware para verificar el token JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; // Obtener el token de las cookies
    if (token) {
        jwt.verify(token, 'tu_secreto', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Ejemplo de uso del middleware en una ruta protegida
app.get('/api/protegida', authenticateJWT, (req, res) => {
    res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

// Endpoint para cerrar sesión y eliminar el token
app.post('/api/logout', (req, res) => {
    res.clearCookie('token'); // Eliminar la cookie del token
    res.json({ message: 'Sesión cerrada exitosamente' });
});

// Endpoint para obtener el rol del usuario logueado
app.get('/api/rol', authenticateJWT, (req, res) => {
    res.json({ rol: req.user.rol });
});

// Endpoint para obtener las secciones/grupos
app.get('/api/seccion-grupos', async (req, res) => {
    const db = new DBConnection();
    try {
        const query = 'SELECT Id_SeccionGrupo AS id, Nombre_SeccionGrupo AS nombre FROM tbSeccionGrupo';
        const secciones = await db.query(query);
        res.json(secciones);
    } catch (error) {
        console.error('Error obteniendo secciones/grupos:', error.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

// Endpoint para obtener niveles
app.get('/nivel', async (req, res) => {
    const db = new DBConnection();
    try {
        const query = `SELECT Id_Nivel, Nombre_Nivel FROM tbNivel ORDER BY Nombre_Nivel ASC`;
        const niveles = await db.query(query);
        res.json(niveles);
    } catch (err) {
        console.error('Error al obtener niveles:', err.message);
        res.status(500).send('Error del servidor al obtener niveles');
    } finally {
        db.close();
    }
});

// Endpoint para obtener etapas
app.get('/etapa', async (req, res) => {
    const db = new DBConnection();
    try {
        const query = `SELECT id_etapa, porcentaje_etapa FROM tbEtapa ORDER BY porcentaje_etapa ASC`;
        const etapas = await db.query(query);
        res.json(etapas);
    } catch (err) {
        console.error('Error al obtener etapas:', err.message);
        res.status(500).send('Error del servidor al obtener etapas');
    } finally {
        db.close();
    }
});

// Endpoint para agregar una nueva rúbrica o escala
app.post('/api/rubricas', async (req, res) => {
    const db = new DBConnection();

    const { nombre_Rubrica, Id_Nivel, Id_Especialidad, id_etapa, Id_TipoEvaluacion, Año } = req.body;

    if (!nombre_Rubrica || !Id_Nivel || !Id_Especialidad || !id_etapa || !Id_TipoEvaluacion || !Año) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `
            INSERT INTO tbRubrica (nombre_Rubrica, Id_Nivel, Id_Especialidad, Año, id_etapa, id_TipoEvaluacion)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [nombre_Rubrica, Id_Nivel, Id_Especialidad, Año, id_etapa, Id_TipoEvaluacion];

        const result = await db.query(query, values);

        const nuevoId = result.insertId;

        res.status(201).json({
            message: 'Evaluación guardada exitosamente',
            id: nuevoId
        });
    } catch (error) {
        console.error('Error al insertar rúbrica:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

// Endpoint para agregar un nuevo criterio
app.post('/api/criterios', async (req, res) => {
    const db = new DBConnection();

    const {
        id_Rubrica,
        nombre_Criterio,
        descripcion_Criterio,
        puntaje_Criterio,
        ponderacion_Criterio
    } = req.body;

    // Validar campos obligatorios
    if (!id_Rubrica || !nombre_Criterio) {
        return res.status(400).json({ message: 'id_Rubrica y nombre_Criterio son obligatorios' });
    }

    try {
        const query = `
            INSERT INTO tbCriterios (id_Rubrica, nombre_Criterio, descripcion_Criterio, puntaje_Criterio, ponderacion_Criterio)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            id_Rubrica,
            nombre_Criterio,
            descripcion_Criterio || '',
            puntaje_Criterio || 0,
            ponderacion_Criterio || 0
        ];

        await db.query(query, values);

        res.status(201).json({ message: 'Criterio guardado exitosamente' });
    } catch (error) {
        console.error('Error al insertar criterio:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

// Endpoint para obtener rubricas
app.get('/api/rubricas', async (req, res) => {
  const db = new DBConnection();

  try {
    const query = `
      SELECT 
        r.id_Rubrica,
        r.nombre_Rubrica,
        r.Año,
        e.porcentaje_etapa,
        t.nombre_TipoEvaluacion
      FROM tbRubrica r
      INNER JOIN tbEtapa e ON r.id_etapa = e.id_etapa
      INNER JOIN tbTipoEvaluacion t ON r.id_TipoEvaluacion = t.id_TipoEvaluacion
      ORDER BY r.id_Rubrica DESC
    `;

    const rubricas = await db.query(query, []);

    res.status(200).json(rubricas);
  } catch (error) {
    console.error('Error al obtener las rúbricas:', error.message);
    res.status(500).json({ message: 'Error al obtener las rúbricas' });
  } finally {
    db.close();
  }
});

app.get('/api/estudiantes', async (req, res) => {
    const db = new DBConnection();
    const { nivel, minNivel, maxNivel, search } = req.query;

    let query = `
        SELECT e.id_Estudiante, e.Codigo_Carnet, e.nombre_Estudiante,
                e.apellido_Estudiante, n.Nombre_Nivel, n.Id_Nivel, 
                s.Nombre_SeccionGrupo, s.Id_SeccionGrupo,
                e.Id_Especialidad, e.id_Proyecto
        FROM tbEstudiantes e
        JOIN tbNivel n ON e.Id_Nivel = n.Id_Nivel
        JOIN tbSeccionGrupo s ON e.Id_SeccionGrupo = s.Id_SeccionGrupo
        WHERE 1=1
    `;

    const values = [];

    if (nivel) {
        query += ' AND e.Id_Nivel = ?';
        values.push(nivel);
    }

    if (minNivel && maxNivel) {
        query += ' AND e.Id_Nivel BETWEEN ? AND ?';
        values.push(minNivel, maxNivel);
    }

    if (search) {
        query += ' AND (e.nombre_Estudiante LIKE ? OR e.apellido_Estudiante LIKE ?)';
        values.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.nombre_Estudiante ASC';

    try {
        const estudiantes = await db.query(query, values);
        res.json(estudiantes);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.get('/api/niveles', async (req, res) => {
    const db = new DBConnection();

    try {
        const niveles = await db.query('SELECT * FROM tbNivel ORDER BY Id_Nivel');
        res.json(niveles);
    } catch (error) {
        console.error('Error al obtener niveles:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.get('/api/secciones', async (req, res) => {
    const db = new DBConnection();

    try {
        const secciones = await db.query('SELECT * FROM tbSeccionGrupo ORDER BY Nombre_SeccionGrupo');
        res.json(secciones);
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.get('/api/especialidades', async (req, res) => {
    const db = new DBConnection();

    try {
        const especialidades = await db.query('SELECT * FROM tbEspecialidad ORDER BY Nombre_Especialidad');
        res.json(especialidades);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.get('/api/proyectos/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;

    try {
        const query = `
            SELECT p.id_Proyecto, p.nombre_Proyecto, p.link_google_sites, 
                   n.Nombre_Nivel, s.Nombre_SeccionGrupo, e.Nombre_Especialidad
            FROM tbProyectos p
            JOIN tbNivel n ON p.Id_Nivel = n.Id_Nivel
            JOIN tbSeccionGrupo s ON p.Id_SeccionGrupo = s.Id_SeccionGrupo
            LEFT JOIN tbEspecialidad e ON p.Id_Especialidad = e.Id_Especialidad
            WHERE p.id_Proyecto = ?
        `;

        const [proyecto] = await db.query(query, [id]);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.json(proyecto);
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.put('/api/estudiantes/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;
    const { nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad } = req.body;

    try {
        if (!nombre_Estudiante || !apellido_Estudiante || !Id_Nivel || !Id_SeccionGrupo) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        if (Id_Nivel >= 4 && Id_Nivel <= 6 && !Id_Especialidad) {
            return res.status(400).json({ message: 'Especialidad requerida para estudiantes de bachillerato' });
        }

        const query = `
            UPDATE tbEstudiantes
            SET nombre_Estudiante = ?,
                apellido_Estudiante = ?,
                Id_Nivel = ?,
                Id_SeccionGrupo = ?,
                Id_Especialidad = ?
            WHERE id_Estudiante = ?
        `;

        await db.query(query, [
            nombre_Estudiante,
            apellido_Estudiante,
            Id_Nivel,
            Id_SeccionGrupo,
            Id_Especialidad,
            id
        ]);

        res.json({ message: 'Estudiante actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        res.status(500).json({ message: 'Error al actualizar estudiante' });
    } finally {
        db.close();
    }
});

app.delete('/api/eliminarEstudiantes/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;

    try {
        const query = 'DELETE FROM tbEstudiantes WHERE id_Estudiante = ?';
        await db.query(query, [id]);
        res.json({ message: 'Estudiante elimando exitosamente' });
    } catch (error) {
        console.error('Error al eliminar estudiantes:', error);
        res.status(500).json({ message: 'Error al eliminar estudiante' });
    } finally {
        db.close();
    }
});

app.post('/api/guardarEstudiantes', async (req, res) => {
    const db = new DBConnection();

    try {
        const { codigo, nombres, apellidos, idNivel, idSeccion, idEspecialidad } = req.body;

        if (!codigo || !nombres || !apellidos || !idNivel || !idSeccion) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados' });
        }

        const query = `
      INSERT INTO tbEstudiantes 
      (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(query, [
            codigo, nombres, apellidos, idNivel, idSeccion, idEspecialidad || null
        ]);

        res.status(201).json({
            message: 'Estudiante guardado correctamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al guardar estudiante:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/estudiantes/importar', upload.single('excelFile'), async (req, res) => {
    const db = new DBConnection();

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        if (data.length === 0) {
            return res.status(400).json({ message: 'El archivo no contiene datos' });
        }

        const niveles = await db.query('SELECT Id_Nivel, Nombre_Nivel FROM tbNivel');
        const nivelesMap = new Map(niveles.map(n => [n.Nombre_Nivel.toLowerCase(), n.Id_Nivel]));

        const secciones = await db.query('SELECT Id_SeccionGrupo, Nombre_SeccionGrupo FROM tbSeccionGrupo');
        const seccionesMap = new Map(secciones.map(s => [s.Nombre_SeccionGrupo.toLowerCase(), s.Id_SeccionGrupo]));

        const especialidades = await db.query('SELECT Id_Especialidad, Nombre_Especialidad FROM tbEspecialidad');
        const especialidadesMap = new Map(especialidades.map(e => [e.Nombre_Especialidad.toLowerCase(), e.Id_Especialidad]));

        const estudiantes = [];
        const errores = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            if (!row.Codigo || !row.Nombres || !row.Apellidos || !row.Nivel || !row.Seccion) {
                errores.push(`Fila ${i + 2}: Faltan campos obligatorios`);
                continue;
            }

            let idNivel, idSeccion, idEspecialidad = null;

            const nivelNombre = String(row.Nivel).toLowerCase();
            idNivel = nivelesMap.get(nivelNombre);
            if (!idNivel) {
                errores.push(`Fila ${i + 2}: Nivel '${row.Nivel}' no encontrado`);
                continue;
            }

            const seccionNombre = String(row.Seccion).toLowerCase();
            idSeccion = seccionesMap.get(seccionNombre);
            if (!idSeccion) {
                errores.push(`Fila ${i + 2}: Sección '${row.Seccion}' no encontrada`);
                continue;
            }

            if (row.Especialidad) {
                const especialidadNombre = String(row.Especialidad).toLowerCase();
                idEspecialidad = especialidadesMap.get(especialidadNombre);
                if (!idEspecialidad) {
                    errores.push(`Fila ${i + 2}: Especialidad '${row.Especialidad}' no encontrada`);
                    continue;
                }
            }

            estudiantes.push([
                row.Codigo,
                row.Nombres,
                row.Apellidos,
                idNivel,
                idSeccion,
                idEspecialidad
            ]);
        }

        if (errores.length > 0 && estudiantes.length === 0) {
            return res.status(400).json({
                message: 'No se pudo procesar ningún estudiante',
                errores
            });
        }

        if (estudiantes.length > 0) {
            const query = `
        INSERT INTO tbEstudiantes 
        (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) 
        VALUES ?
      `;

            await db.query(query, [estudiantes]);
        }

        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Archivo procesado correctamente',
            insertados: estudiantes.length,
            errores: errores.length > 0 ? errores : undefined
        });
    }catch(error){
        console.error('Error al procesar archivo Excel:', error);

        try{
            const fs = require('fs');
            if(req.file && fs.existsSync(req.file.path)){
                fs.unlinkSync(req.file.path);
            }
        }catch(e){
            console.error('Error al eliminar archivo temporal:', e);
        }
        res.status(500).json({message: 'Error del servidor'});
    }finally{
        db.close();
    }
});

// Servidor escuchando en el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
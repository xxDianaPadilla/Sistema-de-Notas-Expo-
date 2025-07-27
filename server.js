const express = require('express');
const DBConnection = require('./js/claseConexion');
const app = express();
const PORT = 5501;
const cors = require('cors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_2024';
const JWT_EXPIRES_IN = '30m';

app.use(cookieParser());


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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('pages'));
app.use(express.static('styles'));
app.use(express.static('img'));
app.use(express.static('js'));
app.use('/formsUsers', express.static('pages/formsUsers'));

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.get('/escala', (req, res) => {
    res.sendFile(__dirname + '/pages/escala.html');
});

app.get('/newRubric', (req, res) => {
    res.sendFile(__dirname + '/pages/newRubric.html');
});

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

// crear rubrica
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

const verificarToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: 'No autorizado: Token no encontrado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.clearCookie('authToken');
            return res.status(401).json({ message: 'Token expirado' });
        }
        return res.status(401).json({ message: 'Token inválido' });
    }
};

app.get('/usuarios-conectados', verificarToken, async (req, res) => {
    const db = new DBConnection();
    
    try {
        await db.query(`
            UPDATE tbUsuario 
            SET Estado_Conexion = FALSE 
            WHERE Estado_Conexion = TRUE 
              AND (
                Ultima_Actividad IS NULL 
                OR Ultima_Actividad < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
              )
        `);

        await db.query(`
            UPDATE tbHistorialConexiones 
            SET 
                Estado_Sesion = 'timeout',
                Fecha_Fin_Sesion = NOW(),
                Duracion_Sesion = TIMESTAMPDIFF(MINUTE, Fecha_Inicio_Sesion, NOW())
            WHERE Estado_Sesion = 'activa' 
              AND Id_Usuario IN (
                SELECT Id_Usuario 
                FROM tbUsuario 
                WHERE (Ultima_Actividad < DATE_SUB(NOW(), INTERVAL 15 MINUTE) OR Ultima_Actividad IS NULL)
                  AND Estado_Conexion = FALSE
              )
        `);

        const query = `
            SELECT 
                u.Id_Usuario,
                u.Nombre_Usuario AS Nombre,
                u.Apellido_Usuario AS Apellido,
                r.nombreRol AS Rol,
                u.FechaHora_Conexion,
                u.Ultima_Actividad,
                u.Estado_Conexion,
                h_reciente.Fecha_Inicio_Sesion AS FechaConexion,
                h_reciente.Fecha_Fin_Sesion,
                h_reciente.IP_Conexion,
                h_reciente.Estado_Sesion,
                h_reciente.Duracion_Sesion,
                CASE 
                    WHEN u.Estado_Conexion = TRUE 
                         AND u.Ultima_Actividad >= DATE_SUB(NOW(), INTERVAL 15 MINUTE) 
                    THEN 'CONECTADO'
                    WHEN h_activa.Id_Historial IS NOT NULL 
                    THEN 'CONECTADO'
                    WHEN h_reciente.Fecha_Fin_Sesion IS NOT NULL 
                    THEN 'DESCONECTADO'
                    ELSE 'INACTIVO'
                END AS Estado_Actual
            FROM tbUsuario u
            INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
            LEFT JOIN tbHistorialConexiones h_activa ON u.Id_Usuario = h_activa.Id_Usuario 
                AND h_activa.Estado_Sesion = 'activa'
            LEFT JOIN tbHistorialConexiones h_reciente ON u.Id_Usuario = h_reciente.Id_Usuario
                AND h_reciente.Fecha_Inicio_Sesion = (
                    SELECT MAX(Fecha_Inicio_Sesion) 
                    FROM tbHistorialConexiones 
                    WHERE Id_Usuario = u.Id_Usuario
                      AND Fecha_Inicio_Sesion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                )
            WHERE (
                (u.Estado_Conexion = TRUE 
                 AND u.Ultima_Actividad >= DATE_SUB(NOW(), INTERVAL 15 MINUTE))
                OR
                (h_activa.Id_Historial IS NOT NULL)
                OR
                (h_reciente.Id_Historial IS NOT NULL)
            )
            ORDER BY 
                u.Estado_Conexion DESC,
                COALESCE(u.Ultima_Actividad, u.FechaHora_Conexion, h_reciente.Fecha_Inicio_Sesion) DESC
        `;

        const usuarios = await db.query(query);
        res.json(usuarios);
        
    } catch (err) {
        console.error('Error obteniendo usuarios conectados:', err.message);
        res.status(500).json({ 
            error: 'Error del servidor', 
            details: err.message 
        });
    } finally {
        db.close();
    }
});

app.use((req, res, next) => {
    const rutasProtegidas = [
        '/dashboard.html',
        '/users.html',
        '/projects.html',
        '/evaluation.html',
        '/configFechas.html',
        '/escala.html',
        '/newRubric.html'
    ];

    const requiereAuth = rutasProtegidas.some(ruta => req.path.includes(ruta));

    if (requiereAuth) {
        const token = req.cookies.authToken;

        if (!token) {
            return res.redirect('/index.html?expired=true');
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.usuario = decoded;
            next();
        } catch (error) {
            res.clearCookie('authToken');
            return res.redirect('/index.html?expired=true');
        }
    } else {
        next();
    }
});

app.post('/api/login', async (req, res) => {
    const db = new DBConnection();
    const { correo, contraseña } = req.body;

    try {
        if (!correo || !contraseña) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        }

        const query = `
            SELECT u.*, r.nombreRol 
            FROM tbUsuario u
            INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
            WHERE u.Correo_Usuario = ?
        `;

        const [usuario] = await db.query(query, [correo]);

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.Contra_Usuario);

        if (!contraseñaValida) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const ipUsuario = req.ip || req.connection.remoteAddress || 'Desconocida';

        await db.query(`
            UPDATE tbHistorialConexiones 
            SET 
                Fecha_Fin_Sesion = NOW(),
                Duracion_Sesion = TIMESTAMPDIFF(MINUTE, Fecha_Inicio_Sesion, NOW()),
                Estado_Sesion = 'cerrada'
            WHERE Id_Usuario = ? AND Estado_Sesion = 'activa'
        `, [usuario.Id_Usuario]);

        await db.query(
            'UPDATE tbUsuario SET Estado_Conexion = TRUE, FechaHora_Conexion = NOW(), Ultima_Actividad = NOW() WHERE Id_Usuario = ?',
            [usuario.Id_Usuario]
        );

        await db.query(`
            INSERT INTO tbHistorialConexiones (Id_Usuario, Fecha_Inicio_Sesion, IP_Conexion, Estado_Sesion)
            VALUES (?, NOW(), ?, 'activa')
        `, [usuario.Id_Usuario, ipUsuario]);

        const token = jwt.sign(
            {
                id: usuario.Id_Usuario,
                nombre: usuario.Nombre_Usuario,
                apellido: usuario.Apellido_Usuario,
                correo: usuario.Correo_Usuario,
                rol: usuario.nombreRol,
                idRol: usuario.Id_Rol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login exitoso',
            usuario: {
                id: usuario.Id_Usuario,
                nombre: usuario.Nombre_Usuario,
                apellido: usuario.Apellido_Usuario,
                rol: usuario.nombreRol,
                idRol: usuario.Id_Rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/logout', verificarToken, async (req, res) => {
    const db = new DBConnection();

    try {
        const usuarioId = req.usuario.id;

        await db.query(
            'UPDATE tbUsuario SET Estado_Conexion = FALSE, Ultima_Actividad = NOW() WHERE Id_Usuario = ?',
            [usuarioId]
        );

        await db.query(`
            UPDATE tbHistorialConexiones 
            SET 
                Fecha_Fin_Sesion = NOW(),
                Duracion_Sesion = TIMESTAMPDIFF(MINUTE, Fecha_Inicio_Sesion, NOW()),
                Estado_Sesion = 'cerrada'
            WHERE Id_Usuario = ? AND Estado_Sesion = 'activa'
        `, [usuarioId]);

        res.clearCookie('authToken');
        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.get('/usuarios-conectados', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        const query = `
            SELECT 
                tbUsuario.Id_Usuario,
                tbUsuario.Nombre_Usuario AS Nombre,
                tbUsuario.Apellido_Usuario AS Apellido,
                tbRol.nombreRol AS Rol,
                tbUsuario.FechaHora_Conexion AS FechaConexion,
                tbUsuario.Estado_Conexion,
                tbUsuario.Ultima_Actividad
            FROM
                tbUsuario
            INNER JOIN
                tbRol
            ON
                tbUsuario.Id_Rol = tbRol.Id_Rol
            WHERE
                tbUsuario.Estado_Conexion = TRUE
            ORDER BY
                tbUsuario.Ultima_Actividad DESC
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

app.get('/api/usuario-actual', verificarToken, (req, res) => {
    res.json({
        id: req.usuario.id,
        nombre: req.usuario.nombre,
        apellido: req.usuario.apellido,
        correo: req.usuario.correo,
        rol: req.usuario.idRol,
        nombreRol: req.usuario.rol
    });
});

app.get('/api/verificar-sesion', verificarToken, async (req, res) => {
    const db = new DBConnection();

    try {
        await db.query(
            'UPDATE tbUsuario SET Ultima_Actividad = NOW() WHERE Id_Usuario = ?',
            [req.usuario.id]
        );

        const [usuario] = await db.query(
            `SELECT u.*, r.nombreRol 
             FROM tbUsuario u
             INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
             WHERE u.Id_Usuario = ?`,
            [req.usuario.id]
        );

        res.status(200).json({
            valido: true,
            usuario: {
                id: usuario.Id_Usuario,
                nombre: usuario.Nombre_Usuario,
                apellido: usuario.Apellido_Usuario,
                correo: usuario.Correo_Usuario,
                rol: usuario.nombreRol,
                idRol: usuario.Id_Rol
            }
        });
    } catch (error) {
        console.error('Error verificando sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

setInterval(async () => {
    const db = new DBConnection();
    try {
        await db.query(
            `UPDATE tbUsuario 
             SET Estado_Conexion = FALSE 
             WHERE Estado_Conexion = TRUE 
             AND Ultima_Actividad < DATE_SUB(NOW(), INTERVAL 35 MINUTE)`
        );
    } catch (error) {
        console.error('Error limpiando sesiones inactivas:', error);
    } finally {
        db.close();
    }
}, 5 * 60 * 1000);

app.post('/api/refrescar-token', verificarToken, async (req, res) => {
    const db = new DBConnection();

    try {
        const nuevoToken = jwt.sign(
            {
                id: req.usuario.id,
                nombre: req.usuario.nombre,
                apellido: req.usuario.apellido,
                correo: req.usuario.correo,
                rol: req.usuario.rol,
                idRol: req.usuario.idRol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        await db.query(
            'UPDATE tbUsuario SET Ultima_Actividad = NOW() WHERE Id_Usuario = ?',
            [req.usuario.id]
        );

        res.cookie('authToken', nuevoToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000
        });

        res.status(200).json({ message: 'Token refrescado exitosamente' });
    } catch (error) {
        console.error('Error refrescando token:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/usuarios', async (req, res) => {
    const db = new DBConnection();
    const { nombre, apellido, correo, contraseña, idRol } = req.body;

    if (!nombre || !apellido || !correo || !contraseña || !idRol) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
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

app.get('/api/usuarios', async (req, res) => {
    const db = new DBConnection();
    const { rol } = req.query;

    let query = 'SELECT * FROM tbUsuario';
    const values = [];

    if (rol) {
        query += ' WHERE Id_Rol = ?';
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

app.get('/api/usuarios/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM tbUsuario WHERE Id_Usuario = ?';
        const [usuario] = await db.query(query, [id]);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.put('/api/usuarios/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;
    const { nombre, apellido, correo, contraseña, idRol } = req.body;

    if (!nombre || !apellido || !correo || !idRol) {
        return res.status(400).json({ message: 'Nombre, apellido, correo y rol son obligatorios' });
    }

    try {
        let query;
        let values;

        if (contraseña) {
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            query = `
                UPDATE tbUsuario 
                SET Nombre_Usuario = ?, 
                    Apellido_Usuario = ?, 
                    Correo_Usuario = ?, 
                    Contra_Usuario = ?, 
                    Id_Rol = ?
                WHERE Id_Usuario = ?
            `;
            values = [nombre, apellido, correo, hashedPassword, idRol, id];
        } else {
            query = `
                UPDATE tbUsuario 
                SET Nombre_Usuario = ?, 
                    Apellido_Usuario = ?, 
                    Correo_Usuario = ?, 
                    Id_Rol = ?
                WHERE Id_Usuario = ?
            `;
            values = [nombre, apellido, correo, idRol, id];
        }

        const result = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

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

app.post('/api/criterios', async (req, res) => {
    const db = new DBConnection();

    const {
        id_Rubrica,
        nombre_Criterio,
        descripcion_Criterio,
        puntaje_Criterio,
        ponderacion_Criterio
    } = req.body;

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

// Obtener rubricas
app.get('/api/rubricas', async (req, res) => {
    const db = new DBConnection();

    try {
        const query = `
      SELECT 
        r.id_Rubrica,
        r.nombre_Rubrica,
        r.id_TipoEvaluacion,
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

// GET /api/criterios/:idRubrica - Obtener criterios de una rúbrica
app.get('/api/criterios/:idRubrica', async (req, res) => {
    const db = new DBConnection();
    const { idRubrica } = req.params;

    try {
        const query = `
            SELECT 
                id_Criterio,
                nombre_Criterio,
                descripcion_Criterio,
                puntaje_Criterio,
                ponderacion_Criterio
            FROM tbCriterios 
            WHERE id_Rubrica = ?
            ORDER BY id_Criterio ASC
        `;

        const criterios = await db.query(query, [idRubrica]);
        res.status(200).json(criterios);
    } catch (error) {
        console.error('Error al obtener criterios:', error.message);
        res.status(500).json({ message: 'Error al obtener criterios' });
    } finally {
        db.close();
    }
});

// PUT /api/criterios/:id - Actualizar criterio existente
app.put('/api/criterios/:id', async (req, res) => {
    const db = new DBConnection();
    const { id } = req.params;
    const { nombre_Criterio, descripcion_Criterio, puntaje_Criterio, ponderacion_Criterio } = req.body;

    try {
        const query = `
            UPDATE tbCriterios 
            SET nombre_Criterio = ?, 
                descripcion_Criterio = ?, 
                puntaje_Criterio = ?, 
                ponderacion_Criterio = ?
            WHERE id_Criterio = ?
        `;

        await db.query(query, [nombre_Criterio, descripcion_Criterio, puntaje_Criterio, ponderacion_Criterio, id]);
        res.status(200).json({ message: 'Criterio actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar criterio:', error.message);
        res.status(500).json({ message: 'Error al actualizar criterio' });
    } finally {
        db.close();
    }
});

// Eliminar criterios
app.delete('/api/criterios/:id', async (req, res) => {
    const db = new DBConnection();
    const id = req.params.id;

    try {
        const query = `DELETE FROM tbCriterios WHERE id_Criterio = ?`;
        const result = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Criterio no encontrado' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Criterio eliminado exitosamente',
            id_Criterio: id
        });
    } catch (error) {
        console.error('Error al eliminar criterio:', error.message);
        
        res.status(500).json({ 
            success: false,
            message: 'Error del servidor' 
        });
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

app.delete('/api/rubricas/:id', async (req, res) => {
    const db = new DBConnection();
    const id = req.params.id;

    try {
        const query = `DELETE FROM tbRubrica WHERE id_Rubrica = ?`;
        const result = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rúbrica no encontrada' });
        }

        res.status(200).json({ message: 'Rúbrica eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar rúbrica:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
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
    } catch (error) {
        console.error('Error al procesar archivo Excel:', error);

        try {
            const fs = require('fs');
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (e) {
            console.error('Error al eliminar archivo temporal:', e);
        }
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/actualizar-actividad', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        const usuarioId = req.usuario.id;

        await db.query(
            'UPDATE tbUsuario SET Ultima_Actividad = NOW() WHERE Id_Usuario = ?',
            [usuarioId]
        );

        res.status(200).json({ message: 'Actividad actualizada' });
    } catch (error) {
        console.error('Error actualizando actividad: ', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/limpiar-usuarios-inactivos', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        if (req.usuario.idRol !== 1) {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
        }

        const resultado = await db.query(`
            UPDATE tbUsuario 
            SET Estado_Conexion = FALSE 
            WHERE Estado_Conexion = TRUE 
            AND (Ultima_Actividad IS NULL OR Ultima_Actividad < DATE_SUB(NOW(), INTERVAL 10 MINUTE))
        `);

        res.status(200).json({
            message: 'Usuarios inactivos limpiados exitosamente',
            usuariosActualizados: resultado.affectedRows
        });
    } catch (error) {
        console.error('Error limpiando usuarios inactivos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.get('/usuarios-historial', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        if (req.usuario.idRol !== 1) {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden ver el historial.' });
        }

        await db.query(`
            UPDATE tbUsuario 
            SET Estado_Conexion = FALSE 
            WHERE Estado_Conexion = TRUE 
            AND (Ultima_Actividad IS NULL OR Ultima_Actividad < DATE_SUB(NOW(), INTERVAL 10 MINUTE))
        `);

        const query = `
            SELECT 
                u.Id_Usuario,
                u.Nombre_Usuario AS Nombre,
                u.Apellido_Usuario AS Apellido,
                r.nombreRol AS Rol,
                u.FechaHora_Conexion AS FechaConexion,
                u.Estado_Conexion,
                u.Ultima_Actividad,
                TIMESTAMPDIFF(MINUTE, u.Ultima_Actividad, NOW()) AS MinutosSinActividad,
                TIMESTAMPDIFF(MINUTE, u.FechaHora_Conexion, NOW()) AS MinutosConectado,
                DATE(u.FechaHora_Conexion) AS FechaConexionSolo
            FROM tbUsuario u
            INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
            WHERE u.FechaHora_Conexion IS NOT NULL
            ORDER BY u.FechaHora_Conexion DESC
            LIMIT 100
        `;
        
        const historial = await db.query(query);
        res.json(historial);
    } catch (err) {
        console.error('Error obteniendo historial de usuarios:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.get('/usuario-actividad/:id', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        const userId = req.params.id;

        if (req.usuario.idRol !== 1 && req.usuario.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        const query = `
            SELECT 
                u.Id_Usuario,
                u.Nombre_Usuario AS Nombre,
                u.Apellido_Usuario AS Apellido,
                r.nombreRol AS Rol,
                u.FechaHora_Conexion AS FechaConexion,
                u.Estado_Conexion,
                u.Ultima_Actividad,
                TIMESTAMPDIFF(MINUTE, u.Ultima_Actividad, NOW()) AS MinutosSinActividad,
                TIMESTAMPDIFF(MINUTE, u.FechaHora_Conexion, COALESCE(u.Ultima_Actividad, NOW())) AS DuracionSesion
            FROM tbUsuario u
            INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
            WHERE u.Id_Usuario = ?
        `;

        const [usuario] = await db.query(query, [userId]);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (err) {
        console.error('Error obteniendo actividad del usuario:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.post('/api/registrar-inicio-sesion', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        const usuarioId = req.usuario.id;
        const ipUsuario = req.ip || req.connection.remoteAddress || 'Desconocida';

        await db.query(`
            UPDATE tbHistorialConexiones 
            SET 
                Fecha_Fin_Sesion = NOW(),
                Duracion_Sesion = TIMESTAMPDIFF(MINUTE, Fecha_Inicio_Sesion, NOW()),
                Estado_Sesion = 'cerrada'
            WHERE Id_Usuario = ? AND Estado_Sesion = 'activa'
        `, [usuarioId]);

        await db.query(`
            INSERT INTO tbHistorialConexiones (Id_Usuario, Fecha_Inicio_Sesion, IP_Conexion)
            VALUES (?, NOW(), ?)
        `, [usuarioId, ipUsuario]);

        res.status(200).json({ message: 'Sesión registrada exitosamente' });
    } catch (error) {
        console.error('Error registrando inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.post('/api/cerrar-sesion-historial', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        const usuarioId = req.usuario.id;

        await db.query(`
            UPDATE tbHistorialConexiones 
            SET 
                Fecha_Fin_Sesion = NOW(),
                Duracion_Sesion = TIMESTAMPDIFF(MINUTE, Fecha_Inicio_Sesion, NOW()),
                Estado_Sesion = 'cerrada'
            WHERE Id_Usuario = ? AND Estado_Sesion = 'activa'
        `, [usuarioId]);

        res.status(200).json({ message: 'Sesión cerrada en historial' });
    } catch (error) {
        console.error('Error cerrando sesión en historial:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.get('/historial-conexiones-detallado', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        if (req.usuario.idRol !== 1) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        const { limite = 50, pagina = 1, usuario_id = null } = req.query;
        const offset = (pagina - 1) * limite;

        let query = `
            SELECT 
                h.Id_Historial,
                h.Id_Usuario,
                u.Nombre_Usuario AS Nombre,
                u.Apellido_Usuario AS Apellido,
                r.nombreRol AS Rol,
                h.Fecha_Inicio_Sesion,
                h.Fecha_Fin_Sesion,
                h.Duracion_Sesion,
                h.IP_Conexion,
                h.Estado_Sesion,
                CASE 
                    WHEN h.Estado_Sesion = 'activa' THEN TIMESTAMPDIFF(MINUTE, h.Fecha_Inicio_Sesion, NOW())
                    ELSE h.Duracion_Sesion
                END AS DuracionActual
            FROM tbHistorialConexiones h
            INNER JOIN tbUsuario u ON h.Id_Usuario = u.Id_Usuario
            INNER JOIN tbRol r ON u.Id_Rol = r.Id_Rol
        `;

        const params = [];
        
        if (usuario_id) {
            query += ' WHERE h.Id_Usuario = ?';
            params.push(usuario_id);
        }

        query += ' ORDER BY h.Fecha_Inicio_Sesion DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const historial = await db.query(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM tbHistorialConexiones h';
        if (usuario_id) {
            countQuery += ' WHERE h.Id_Usuario = ?';
        }
        
        const [{ total }] = await db.query(countQuery, usuario_id ? [usuario_id] : []);

        res.json({
            historial,
            total,
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            totalPaginas: Math.ceil(total / limite)
        });
    } catch (err) {
        console.error('Error obteniendo historial detallado:', err.message);
        res.status(500).send('Error del servidor');
    } finally {
        db.close();
    }
});

app.post('/api/resetear-historial-conexiones', verificarToken, async (req, res) => {
    const db = new DBConnection();
    try {
        if (req.usuario.idRol !== 1) {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
        }

        if (req.body.confirmar !== 'RESETEAR_HISTORIAL') {
            return res.status(400).json({ 
                message: 'Para confirmar, envía el parámetro "confirmar" con valor "RESETEAR_HISTORIAL"' 
            });
        }

        await db.query(`
            UPDATE tbUsuario 
            SET 
                Estado_Conexion = FALSE,
                FechaHora_Conexion = NULL,
                Ultima_Actividad = NULL
        `);

        res.status(200).json({
            message: 'Historial de conexiones reseteado exitosamente'
        });
    } catch (error) {
        console.error('Error reseteando historial:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        db.close();
    }
});

app.delete('/api/eliminar-todos-estudiantes-proyectos', async (req, res) => {
    const db = new DBConnection();

    try {
        await db.query('START TRANSACTION');

        const estudiantesResult = await db.query('DELETE FROM tbEstudiantes');

        const proyectosResult = await db.query('DELETE FROM tbProyectos');
        
        await db.query('COMMIT');

        console.log(`Eliminados ${estudiantesResult.affectedRows} estudiantes y ${proyectosResult.affectedRows} proyectos`);

        res.status(200).json({
            message: 'Todos los estudiantes y proyectos han sido eliminados correctamente',
            estudiantesEliminados: estudiantesResult.affectedRows,
            proyectosEliminados: proyectosResult.affectedRows
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al eliminar estudiantes y proyectos: ', error);
        res.status(500).json({
            message: 'Error al eliminar los estudiantes y proyectos',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Token JWT expira en: ${JWT_EXPIRES_IN}`);
});
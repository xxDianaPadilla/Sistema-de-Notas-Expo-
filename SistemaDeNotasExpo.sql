-- Eliminar la base de datos si existe para empezar desde cero
DROP DATABASE IF EXISTS BasededatosNotasEXPO;

-- Crear la base de datos
CREATE DATABASE BasededatosNotasEXPO;

-- Usar la base de datos recién creada
USE BasededatosNotasEXPO;

-- 1. Crear la tabla tbRol
CREATE TABLE tbRol (
    Id_Rol INT PRIMARY KEY,
    nombreRol TEXT
);

-- Insertar datos en tbRol
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (1, 'Administrador');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (2, 'Estudiante');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (3, 'Docente');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (4, 'Evaluador');

-- Seleccionar datos de tbRol
SELECT * FROM tbRol;

-- 2. Crear la tabla tbNivel
CREATE TABLE tbNivel(
    Id_Nivel INT PRIMARY KEY,
    Nombre_Nivel TEXT,
    letra_nivel TEXT NULL
);

-- Insertar datos en tbNivel
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (1, 'Séptimo', 'A');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (2, 'Octavo', 'B');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (3, 'Noveno', 'C');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (4, '1° Bachillerato', '1');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (5, '2° Bachillerato', '2');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (6, '3° Bachillerato', '3');

-- Seleccionar datos de tbNivel
SELECT * FROM tbNivel;

-- 3. Crear la tabla tbSeccionGrupo
CREATE TABLE tbSeccionGrupo(
    Id_SeccionGrupo INT PRIMARY KEY,
    Nombre_SeccionGrupo TEXT
);

-- Insertar datos en tbSeccionGrupo
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (1, 'A');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (2, 'B');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (3, 'C');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (4, 'D');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (5, 'E');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (6, 'F');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (7, '1A');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (8, '1B');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (9, '2A');
INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES (10, '2B');

-- Seleccionar datos de tbSeccionGrupo
SELECT * FROM tbSeccionGrupo;

-- 4. Crear la tabla tbEspecialidad
CREATE TABLE tbEspecialidad(
    Id_Especialidad INT PRIMARY KEY,
    Nombre_Especialidad TEXT,
    letra_especialidad TEXT
);

-- Insertar datos en tbEspecialidad
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (1, 'Arquitectura', 'B');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (2, 'Mantenimiento Automotriz', 'G');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (3, 'Diseño Gráfico', 'D');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (4, 'Electrónica', 'E');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (5, 'Administrativo Contable', 'A');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (6, 'Desarrollo de Software', 'C');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (7, 'Electromecánica', 'F');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (8, 'Sistemas Eléctricos con Especialización en Energías Renovables y Eficiencia Energética', 'H');

-- Seleccionar datos de tbEspecialidad
SELECT * FROM tbEspecialidad;

-- 5. Crear la tabla tbEstadoProyectos
CREATE TABLE tbEstadoProyectos(
    id_estado INT PRIMARY KEY,
    tipo_estado TEXT
);

-- Insertar datos en tbEstadoProyectos
INSERT INTO tbEstadoProyectos(id_estado, tipo_estado) VALUES (1, 'Activo');
INSERT INTO tbEstadoProyectos(id_estado, tipo_estado) VALUES (2, 'Inactivo');

-- 6. Crear la tabla tbEtapa
CREATE TABLE tbEtapa(
    id_etapa INT PRIMARY KEY,
    porcentaje_etapa TEXT,
    fecha_inicio DATE,
    fecha_fin DATE
);

-- Insertar datos en tbEtapa
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (1, 'Anteproyecto', '2025-01-09', '2025-01-16');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (2, '30%', '2025-01-17', '2025-01-18');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (3, '50%', '2025-01-19', '2025-01-20');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (4, '80%', '2025-01-21', '2025-01-22');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (5, '100%', '2025-01-23', '2025-01-24');

-- Seleccionar datos de tbEtapa
SELECT * FROM tbEtapa;

-- 7. Crear la tabla tbTipoEvaluacion
CREATE TABLE tbTipoEvaluacion (
    id_TipoEvaluacion INT PRIMARY KEY,
    nombre_TipoEvaluacion TEXT
);

-- Insertar datos para Tipo de Evaluación
INSERT INTO tbTipoEvaluacion (id_TipoEvaluacion, nombre_TipoEvaluacion)
VALUES (1, 'Escala estimativa'), (2, 'Rúbrica');

-- Seleccionar datos de tbTipoEvaluacion
SELECT * FROM tbTipoEvaluacion;

-- 8. Crear la tabla tbUsuario (depende de tbRol)
CREATE TABLE tbUsuario(
    Id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Usuario TEXT,
    Apellido_Usuario TEXT,
    Correo_Usuario TEXT,
    Contra_Usuario TEXT,
    Id_Rol INT,
    FechaHora_Conexion DATETIME,
    FOREIGN KEY (Id_Rol) REFERENCES tbRol(Id_Rol)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar datos en tbUsuario
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Juan', 'Pérez', 'juanperez@ricaldone.edu.sv', 'juanperez#123', 2, '2025-01-15 19:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Bryan', 'Miranda', 'bryanmiranda@ricaldone.edu.sv', 'bryanmiranda#123', 3, '2025-01-01 16:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Luis', 'Amaya', 'luisamaya@ricaldone.edu.sv', 'luisamaya#123', 3, '2025-01-01 14:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Carlos', 'Rodríguez', 'carlosrodriguez@ricaldone.edu.sv', 'carlosrodriguez#123', 4, '2025-01-07 17:30:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Diana', 'Padilla', 'dianapadilla@ricaldone.edu.sv', 'dianapadilla#123', 2, '2025-01-08 16:30:00');

-- Seleccionar datos de tbUsuario
SELECT * FROM tbUsuario;

-- Consulta de unión para tbUsuario y tbRol
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
    tbUsuario.FechaHora_Conexion DESC;

-- 9. Crear la tabla tbProyectos (depende de tbNivel, tbSeccionGrupo, tbEstadoProyectos, tbEspecialidad)
CREATE TABLE tbProyectos(
    id_Proyecto VARCHAR(7) PRIMARY KEY,
    nombre_Proyecto TEXT,
    link_google_sites TEXT,
    Id_Nivel INT,
    Id_SeccionGrupo INT,
    id_estado INT,
    Id_Especialidad INT NULL,

    FOREIGN KEY(Id_Nivel) REFERENCES tbNivel(Id_Nivel)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(Id_SeccionGrupo) REFERENCES tbSeccionGrupo(Id_SeccionGrupo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(id_estado) REFERENCES tbEstadoProyectos(id_estado)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(Id_Especialidad) REFERENCES tbEspecialidad(Id_Especialidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar datos en tbProyectos
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('CA01-25', 'Ambilight', 'https://sites.google.com/ricaldone.edu.sv/CA01-25', 3, 1, 1);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado, Id_Especialidad) VALUES ('C101-25', 'The Friendly Pet', 'https://sites.google.com/ricaldone.edu.sv/C101-25', 4, 7, 1, 6);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('CD01-25', 'Cinematografía', 'https://sites.google.com/ricaldone.edu.sv/CD01-25', 3, 4, 1);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado, Id_Especialidad) VALUES ('D301-25', 'Kairo Detalles', 'https://sites.google.com/ricaldone.edu.sv/D301-25', 6, 7, 1, 3);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('BA01-25', 'Simulador de Frecuencias', 'https://sites.google.com/ricaldone.edu.sv/BA01-25', 2, 1, 1);

-- Seleccionar datos de tbProyectos
SELECT * FROM tbProyectos;

-- Consulta de unión para tbProyectos y tbEstadoProyectos
SELECT
    tbProyectos.id_nivel AS Id_Nivel,
    tbProyectos.nombre_Proyecto AS Nombre,
    tbProyectos.link_google_sites AS Google_Sites,
    tbEstadoProyectos.tipo_estado AS Estado
FROM
    tbProyectos
INNER JOIN
    tbEstadoProyectos
ON
    tbProyectos.id_estado = tbEstadoProyectos.id_estado;

-- 10. Crear la tabla tbEstudiantes (depende de tbNivel, tbSeccionGrupo, tbEspecialidad, tbProyectos)
CREATE TABLE tbEstudiantes(
    id_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Codigo_Carnet INT,
    nombre_Estudiante TEXT,
    apellido_Estudiante TEXT,
    Id_Nivel INT,
    Id_SeccionGrupo INT,
    Id_Especialidad INT NULL,
    id_Proyecto VARCHAR(7) NULL,

    FOREIGN KEY(Id_Nivel) REFERENCES tbNivel(Id_Nivel)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(Id_SeccionGrupo) REFERENCES tbSeccionGrupo(Id_SeccionGrupo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(Id_Especialidad) REFERENCES tbEspecialidad(Id_Especialidad)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(id_Proyecto) REFERENCES tbProyectos(id_Proyecto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar datos en tbEstudiantes
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200001, 'Walter Samuel', 'Castellanos Sunley', 3, 1, 'CA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200002, 'Daniel José', 'Quijano Espino', 3, 1, 'CA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200003, 'Lucia Alejandra', 'Salinas Morales', 3, 1, 'CA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200004, 'Aimee Vanessa', 'Osorio Canales', 3, 1, 'CA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_Proyecto) VALUES (20200005, 'Diana Gabriela', 'Padilla Fuentes', 4, 7, 6, 'C101-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_Proyecto) VALUES (20200006, 'Amaris Lourdes', 'Osorio Canales', 4, 7, 6, 'C101-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_Proyecto) VALUES (20200007, 'Daniel Isaac', 'Granados Cañas', 4, 7, 6, 'C101-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200008, 'José Luis', 'Iraheta Marroquín', 3, 4, 'CD01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200009, 'Edenilson Alexander', 'Amaya Benítez', 3, 4, 'CD01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200010, 'Adriel Levi', 'Moreno Solano', 3, 4, 'CD01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_Proyecto) VALUES (20200011, 'Ana Sofía', 'Mendoza Torres', 6, 7, 3, 'D301-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad, id_Proyecto) VALUES (20200012, 'Juan Pablo', 'Rodríguez López', 6, 7, 3, 'D301-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200014, 'Carlos Andrés', 'Sánchez Díaz', 2, 1, 'BA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) VALUES (20200015, 'Sofía Isabel', 'Martínez Ruiz', 3, 7, 6);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) VALUES (20200016, 'Luis Fernando', 'García Castro', 3, 7, 6);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo) VALUES (20200017, 'Sofía Isabel', 'Martínez López', 2, 1);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo) VALUES (20200018, 'Ana María', 'Rodríguez Sánchez', 2, 1);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, id_Proyecto) VALUES (20200013, 'María Fernanda', 'Pérez Gómez', 2, 1, 'BA01-25');
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) VALUES (20200021, 'Juan Diego', 'González Fernández', 6, 7, 6);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo) VALUES (20200022, 'María Fernanda', 'López Ramírez', 1, 1);
INSERT INTO tbEstudiantes (Codigo_Carnet, nombre_Estudiante, apellido_Estudiante, Id_Nivel, Id_SeccionGrupo, Id_Especialidad) VALUES (20200023, 'Juan Carlos', 'Martínez Gómez', 5, 7, 6);

-- Desactivar modo seguro para permitir actualizaciones sin WHERE clave
SET SQL_SAFE_UPDATES = 0;

-- Seleccionar datos de tbEstudiantes
SELECT * FROM tbEstudiantes;

-- 11. Crear la tabla tbActividad
CREATE TABLE tbActividad(
    Id_Actividad INT AUTO_INCREMENT PRIMARY KEY,
    Titulo_Actividad TEXT,
    Fecha_Inicio DATE,
    Fecha_Fin DATE
);

-- Insertar datos en tbActividad
INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Introducción al Proyecto Técnico Científico', '2025-01-13', '2025-01-17');
INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Presentación de anteproyecto', '2025-01-31', '2025-02-07');

-- Seleccionar datos de tbActividad
SELECT * FROM tbActividad;

-- 12. Crear la tabla tbRubrica (depende de tbEtapa y tbTipoEvaluacion)
CREATE TABLE tbRubrica (
    id_Rubrica INT AUTO_INCREMENT PRIMARY KEY,
    nombre_Rubrica TEXT,
    Id_Nivel INT,
    Id_Especialidad INT,
    Año TEXT,
    id_etapa INT,
    id_TipoEvaluacion INT,

    FOREIGN KEY (id_etapa) REFERENCES tbEtapa (id_etapa)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (id_TipoEvaluacion) REFERENCES tbTipoEvaluacion (id_TipoEvaluacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar datos de ejemplo para tbRubrica (no se proporcionaron en tu script original)
INSERT INTO tbRubrica (id_Rubrica, nombre_Rubrica, Id_Nivel, Id_Especialidad, Año, id_etapa, id_TipoEvaluacion) VALUES
(1, 'Rúbrica de Evaluación de Anteproyecto', 3, NULL, '2025', 1, 2),
(2, 'Rúbrica de Evaluación de Proyecto Final', 6, 6, '2025', 5, 2),
(3, 'Escala Estimativa Diseño Gráfico', 5, 3, '2025', 2, 1);

-- Seleccionar datos de tbRubrica
SELECT * FROM tbRubrica;

-- 13. Crear la tabla tbCriterios (depende de tbRubrica)
CREATE TABLE tbCriterios (
    id_Criterio INT AUTO_INCREMENT PRIMARY KEY,
    id_Rubrica INT,
    nombre_Criterio TEXT,
    descripcion_Criterio TEXT,
    puntaje_Criterio DOUBLE,
    ponderacion_Criterio DOUBLE,

    FOREIGN KEY (id_Rubrica) REFERENCES tbRubrica (id_Rubrica)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar datos para tbCriterios
INSERT INTO tbCriterios (id_Criterio, id_Rubrica, nombre_Criterio, descripcion_Criterio, puntaje_Criterio, ponderacion_Criterio) VALUES
(1, 1, 'Claridad del Objetivo', 'El objetivo del proyecto está claramente definido y es conciso.', 5.0, 0.20),
(2, 1, 'Metodología Propuesta', 'La metodología es lógica y adecuada para alcanzar los objetivos.', 4.5, 0.25),
(3, 1, 'Relevancia del Tema', 'El tema del proyecto es relevante y aporta valor.', 4.0, 0.15),
(4, 2, 'Funcionalidad del Producto', 'El producto final cumple con todas las funciones esperadas.', 5.0, 0.30),
(5, 2, 'Innovación', 'El proyecto demuestra un nivel significativo de innovación.', 4.8, 0.20),
(6, 2, 'Presentación', 'La presentación oral y visual es clara y profesional.', 4.2, 0.15),
(7, 3, 'Creatividad en el Diseño', 'El diseño muestra originalidad y creatividad.', 4.7, 0.30),
(8, 3, 'Uso de Herramientas', 'Se utilizan las herramientas de diseño de manera eficiente.', 4.3, 0.20);

-- Seleccionar datos de tbCriterios
SELECT * FROM tbCriterios;
select * from tbRubrica;
select * from tbTipoEvaluacion
SELECT id_etapa, porcentaje_etapa FROM tbEtapa ORDER BY porcentaje_etapa ASC

select * from tbEtapa
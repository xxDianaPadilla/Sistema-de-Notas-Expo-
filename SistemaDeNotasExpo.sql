Drop database if exists BasededatosNotasEXPO;
create database BasededatosNotasEXPO; 
use BasededatosNotasEXPO;

create table tbRol (
Id_Rol Int primary key,
nombreRol Text 
);

INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (1, 'Administrador');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (2, 'Estudiante');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (3, 'Docente');
INSERT INTO tbRol(Id_Rol, nombreRol) VALUES (4, 'Evaluador');

SELECT * FROM tbRol;

create table tbUsuario(
Id_Usuario Int auto_increment primary key,
Nombre_Usuario Text,
Apellido_Usuario Text,
Correo_Usuario Text,
Contra_Usuario Text,
Id_Rol Int,
FechaHora_Conexion Datetime,
foreign key (Id_Rol)
references tbRol(Id_Rol)
ON Update cascade
on delete cascade
);

ALTER TABLE tbUsuario 
ADD COLUMN Estado_Conexion BOOLEAN DEFAULT FALSE,
ADD COLUMN Ultima_Actividad DATETIME;

SELECT * FROM tbUsuario;

CREATE TABLE tbHistorialConexiones (
    Id_Historial INT AUTO_INCREMENT PRIMARY KEY,
    Id_Usuario INT NOT NULL,
    Fecha_Inicio_Sesion DATETIME NOT NULL,
    Fecha_Fin_Sesion DATETIME NULL,
    Duracion_Sesion INT NULL, -- en minutos
    IP_Conexion VARCHAR(45) NULL,
    Estado_Sesion ENUM('activa', 'cerrada', 'timeout') DEFAULT 'activa',
    FOREIGN KEY (Id_Usuario) REFERENCES tbUsuario(Id_Usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_usuario_fecha (Id_Usuario, Fecha_Inicio_Sesion),
    INDEX idx_fecha (Fecha_Inicio_Sesion)
);

SELECT * FROM tbHistorialConexiones;

INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Juan', 'Pérez', 'juanperez@ricaldone.edu.sv', 'juanperez#123', 2, '2025-01-15 19:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Bryan', 'Miranda', 'bryanmiranda@ricaldone.edu.sv', 'bryanmiranda#123', 3, '2025-01-01 16:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Luis', 'Amaya', 'luisamaya@ricaldone.edu.sv', 'luisamaya#123', 3, '2025-01-01 14:00:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Carlos', 'Rodríguez', 'carlosrodriguez@ricaldone.edu.sv', 'carlosrodriguez#123', 4, '2025-01-07 17:30:00');
INSERT INTO tbUsuario(Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES ('Diana', 'Padilla', 'dianapadilla@ricaldone.edu.sv', 'dianapadilla#123', 2, '2025-01-08 16:30:00');

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

create table tbNivel(
Id_Nivel int primary key,
Nombre_Nivel Text,
letra_nivel text null
);

INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (1, 'Séptimo', 'A');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (2, 'Octavo', 'B');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (3, 'Noveno', 'C');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (4, '1° Bachillerato', '1');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (5, '2° Bachillerato', '2');
INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES (6, '3° Bachillerato', '3');

SELECT * FROM tbNivel;

create table tbSeccionGrupo(
Id_SeccionGrupo Int primary key,
Nombre_SeccionGrupo Text
);

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

SELECT * FROM tbSeccionGrupo;

create table tbEspecialidad(
Id_Especialidad int primary key,
Nombre_Especialidad text, 
letra_especialidad text
);

INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (1, 'Arquitectura', 'B');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (2, 'Mantenimiento Automotriz', 'G');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (3, 'Diseño Gráfico', 'D');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (4, 'Electrónica', 'E');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (5, 'Administrativo Contable', 'A');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (6, 'Desarrollo de Software', 'C');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (7, 'Electromecánica', 'F');
INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES (8, 'Sistemas Eléctricos con Especialización en Energías Renovables y Eficiencia Energética', 'H');

SELECT * FROM tbEspecialidad;

create table tbEstudiantes(
id_Estudiante int auto_increment primary key,
Codigo_Carnet Int,
nombre_Estudiante Text,
apellido_Estudiante text,
Id_Nivel int,
Id_SeccionGrupo int,
Id_Especialidad int null,
id_Proyecto varchar(7) null,

foreign key(Id_Nivel)
references tbNivel(Id_Nivel)
on update cascade 
on delete cascade,

foreign key(Id_SeccionGrupo)
references tbSeccionGrupo(Id_SeccionGrupo)
on update cascade 
on delete cascade,

Foreign key(Id_Especialidad)
references tbEspecialidad(Id_Especialidad)
on update cascade 
on delete cascade,

Foreign key(id_Proyecto)
references tbProyectos(id_Proyecto)
on update cascade 
on delete cascade
);

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

SET SQL_SAFE_UPDATES = 0;

SELECT * FROM tbEstudiantes;

create table tbActividad(
Id_Actividad int auto_increment primary key,
Titulo_Actividad text,
Fecha_Inicio Date,
Fecha_Fin date
);

INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Introducción al Proyecto Técnico Científico', '2025-01-13', '2025-01-17');
INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Presentación de anteproyecto', '2025-01-31', '2025-02-07');

SELECT * FROM tbActividad;

CREATE TABLE tbTipoEvaluacion (
    id_TipoEvaluacion INT PRIMARY KEY,
    nombre_TipoEvaluacion TEXT
);

-- Inserts para Tipo de Evaluación
INSERT INTO tbTipoEvaluacion (id_TipoEvaluacion, nombre_TipoEvaluacion) 
VALUES (1, 'Escala estimativa'), (2, 'Rúbrica');

SELECT * FROM tbTipoEvaluacion;

DROP TABLE tbRubrica;

-- Tabla de Rúbricas
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

SELECT * FROM tbRubrica;

-- Tabla de Criterios
CREATE TABLE tbCriterios (
    id_Criterio INT PRIMARY KEY,
    id_Rubrica INT,
    nombre_Criterio TEXT,
    descripcion_Criterio TEXT,
    puntaje_Criterio DOUBLE,
    ponderacion_Criterio DOUBLE,

    FOREIGN KEY (id_Rubrica) REFERENCES tbRubrica (id_Rubrica) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

create table tbEtapa(
id_etapa int primary key,
porcentaje_etapa text,
fecha_inicio date,
fecha_fin date
);

INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (1, 'Anteproyecto', '2025-01-09', '2025-01-16');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (2, '30%', '2025-01-17', '2025-01-18');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (3, '50%', '2025-01-19', '2025-01-20');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (4, '80%', '2025-01-21', '2025-01-22');
INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES (5, '100%', '2025-01-23', '2025-01-24');

SELECT * FROM tbEtapa;

create table tbEstadoProyectos(
id_estado int primary key,
tipo_estado text
);

INSERT INTO tbEstadoProyectos(id_estado, tipo_estado) VALUES (1, 'Activo');
INSERT INTO tbEstadoProyectos(id_estado, tipo_estado) VALUES (2, 'Inactivo');

create table tbProyectos(
id_Proyecto varchar(7) primary key,
nombre_Proyecto text,
link_google_sites text,
Id_Nivel int,
Id_SeccionGrupo int,
id_estado int,
Id_Especialidad int null,

foreign key(Id_Nivel)
references tbNivel(Id_Nivel)
on update cascade 
on delete cascade,

foreign key(Id_SeccionGrupo)
references tbSeccionGrupo(Id_SeccionGrupo)
on update cascade 
on delete cascade,

foreign key(id_estado)
references tbEstadoProyectos(id_estado)
on update cascade 
on delete cascade,

foreign key(Id_Especialidad)
references tbEspecialidad(Id_Especialidad)
on update cascade 
on delete cascade
);

INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('CA01-25', 'Ambilight', 'https://sites.google.com/ricaldone.edu.sv/CA01-25', 3, 1, 1);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado, Id_Especialidad) VALUES ('C101-25', 'The Friendly Pet', 'https://sites.google.com/ricaldone.edu.sv/C101-25', 4, 7, 1, 6);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('CD01-25', 'Cinematografía', 'https://sites.google.com/ricaldone.edu.sv/CD01-25', 3, 4, 1);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado, Id_Especialidad) VALUES ('D301-25', 'Kairo Detalles', 'https://sites.google.com/ricaldone.edu.sv/D301-25', 6, 7, 1, 3);
INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES ('BA01-25', 'Simulador de Frecuencias', 'https://sites.google.com/ricaldone.edu.sv/BA01-25', 2, 1, 1);

SELECT * FROM tbProyectos;

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
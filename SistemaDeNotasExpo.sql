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
Id_Usuario Int primary key,
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

INSERT INTO tbUsuario(Id_Usuario, Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES (1, 'Juan', 'Pérez', 'juanperez@ricaldone.edu.sv', 'juanperez#123', 2, '2025-01-15 19:00:00');
INSERT INTO tbUsuario(Id_Usuario, Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES (2, 'Bryan', 'Miranda', 'bryanmiranda@ricaldone.edu.sv', 'bryanmiranda#123', 3, '2025-01-01 16:00:00');
INSERT INTO tbUsuario(Id_Usuario, Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES (3, 'Luis', 'Amaya', 'luisamaya@ricaldone.edu.sv', 'luisamaya#123', 3, '2025-01-01 14:00:00');
INSERT INTO tbUsuario(Id_Usuario, Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES (4, 'Carlos', 'Rodríguez', 'carlosrodriguez@ricaldone.edu.sv', 'carlosrodriguez#123', 4, '2025-01-07 17:30:00');
INSERT INTO tbUsuario(Id_Usuario, Nombre_Usuario, Apellido_Usuario, Correo_Usuario, Contra_Usuario, Id_Rol, FechaHora_Conexion) VALUES (5, 'Diana', 'Padilla', 'dianapadilla@ricaldone.edu.sv', 'dianapadilla#123', 2, '2025-01-08 16:30:00');

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
Nombre_Nivel Text 
);

create table tbSeccionGrupo(
Id_SeccionGrupo Int primary key,
Nombre_SeccionGrupo Text
);

create table tbEspecialidad(
Id_Especialidad int primary key,
Nombre_Especialidad text
);

create table tbEstudiantes(
Codigo_Carnet Int primary key,
nombre_Estudiante Text,
apellido_Estudiante text,
Id_Nivel int,
Id_SeccionGrupo int,
Id_Especialidad int null,

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
on delete cascade
);

create table tbActividad(
Id_Actividad int auto_increment primary key,
Titulo_Actividad text,
Fecha_Inicio Date,
Fecha_Fin date
);

INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Introducción al Proyecto Técnico Científico', '2025-01-13', '2025-01-17');
INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Conformación de equipos EXPO', '2025-01-21', '2025-01-22');
INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES ('Presentación de anteproyecto', '2025-01-31', '2025-02-07');
SELECT * FROM tbActividad;

create table tbCriterios(
id_Criterio int primary key,
nombre_Criterio text,
descripcion_Criterio text,
puntaje_Criterio double
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

create table tbRubrica(
id_Rubrica int primary key,
nombre_Rubrica text,
Id_Nivel int,
Id_Especialidad int,
Año text,
id_etapa int,
id_criterios int,

foreign key(id_criterios)
references tbCriterios (id_Criterio)
on update cascade 
on delete cascade,

foreign key (id_etapa)
references tbEtapa (id_etapa)
on update cascade
on delete cascade
);

create table tbProyectos(
id_Proyecto int primary key,
nombre_Proyecto text,
Id_Nivel int,
Id_SeccionGrupo int,
carnet_Estudiante int,

foreign key(carnet_Estudiante)
references tbEstudiantes(Codigo_Carnet)
on update cascade 
on delete cascade
);

SELECT * FROM tbProyectos;
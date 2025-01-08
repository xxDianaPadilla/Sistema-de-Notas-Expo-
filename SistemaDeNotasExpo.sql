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
Id_Actividad int primary key,
Titulo_Actividad text,
Fecha_Inicio Date,
Fecha_Fin date
);

create table tbCriterios(
id_Criterio int primary key,
nombre_Criterio text,
descripcion_Criterio text,
puntaje_Criterio double
);

create table tbRubrica(
id_Rubrica int primary key,
nombre_Rubrica text,
Id_Nivel int,
Id_Especialidad int,
Año text,
Etapa text,
id_criterios int,

foreign key(id_criterios)
references tbCriterios (id_Criterio)
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
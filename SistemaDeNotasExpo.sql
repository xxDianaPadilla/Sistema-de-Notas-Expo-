Drop database if exists BasededatosNotasEXPO;
create database BasededatosNotasEXPO; 
use BasededatosNotasEXPO;

create table tbRol (
Id_Rol Int primary key,
nombreRol Text 
);

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
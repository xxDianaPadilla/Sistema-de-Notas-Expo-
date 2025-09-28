-- Eliminar y crear base de datos
DROP DATABASE IF EXISTS BasededatosNotasEXPO;
CREATE DATABASE BasededatosNotasEXPO;
USE BasededatosNotasEXPO;

-- Tabla Roles
CREATE TABLE tbRol (
  Id_Rol INT PRIMARY KEY,
  nombreRol TEXT
);

INSERT INTO tbRol(Id_Rol, nombreRol) VALUES 
(1, 'Administrador'),
(2, 'Estudiante'),
(3, 'Docente'),
(4, 'Evaluador');

-- Tabla Usuarios
CREATE TABLE tbUsuario (
  Id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Usuario TEXT,
  Apellido_Usuario TEXT,
  Correo_Usuario TEXT,
  Contra_Usuario TEXT,
  Id_Rol INT,
  FechaHora_Conexion DATETIME,
  Estado_Conexion BOOLEAN DEFAULT FALSE,
  Ultima_Actividad DATETIME,
  FOREIGN KEY (Id_Rol) REFERENCES tbRol(Id_Rol)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Historial de conexiones
CREATE TABLE tbHistorialConexiones (
  Id_Historial INT AUTO_INCREMENT PRIMARY KEY,
  Id_Usuario INT NOT NULL,
  Fecha_Inicio_Sesion DATETIME NOT NULL,
  Fecha_Fin_Sesion DATETIME NULL,
  Duracion_Sesion INT NULL, -- en minutos
  IP_Conexion VARCHAR(45) NULL,
  Estado_Sesion ENUM('activa', 'cerrada', 'timeout') DEFAULT 'activa',
  FOREIGN KEY (Id_Usuario) REFERENCES tbUsuario(Id_Usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_usuario_fecha (Id_Usuario, Fecha_Inicio_Sesion),
  INDEX idx_fecha (Fecha_Inicio_Sesion)
);

-- Tabla Niveles
CREATE TABLE tbNivel(
  Id_Nivel INT PRIMARY KEY,
  Nombre_Nivel TEXT,
  letra_nivel TEXT NULL
);

INSERT INTO tbNivel (Id_Nivel, Nombre_Nivel, letra_nivel) VALUES
(1, 'Séptimo', 'A'),
(2, 'Octavo', 'B'),
(3, 'Noveno', 'C'),
(4, '1° Bachillerato', '1'),
(5, '2° Bachillerato', '2'),
(6, '3° Bachillerato', '3');

-- Tabla Sección/Grupo
CREATE TABLE tbSeccionGrupo(
  Id_SeccionGrupo INT PRIMARY KEY,
  Nombre_SeccionGrupo TEXT
);

INSERT INTO tbSeccionGrupo (Id_SeccionGrupo, Nombre_SeccionGrupo) VALUES
(1, 'A'), (2, 'B'), (3, 'C'), (4, 'D'),
(5, 'E'), (6, 'F'), (7, '1A'), (8, '1B'),
(9, '2A'), (10, '2B');

-- Tabla Especialidades
CREATE TABLE tbEspecialidad(
  Id_Especialidad INT PRIMARY KEY,
  Nombre_Especialidad TEXT, 
  letra_especialidad TEXT
);

INSERT INTO tbEspecialidad (Id_Especialidad, Nombre_Especialidad, letra_especialidad) VALUES
(1, 'Arquitectura', 'B'),
(2, 'Mantenimiento Automotriz', 'G'),
(3, 'Diseño Gráfico', 'D'),
(4, 'Electrónica', 'E'),
(5, 'Administrativo Contable', 'A'),
(6, 'Desarrollo de Software', 'C'),
(7, 'Electromecánica', 'F'),
(8, 'Sistemas Eléctricos con Especialización en Energías Renovables y Eficiencia Energética', 'H');

-- Estado de proyectos
CREATE TABLE tbEstadoProyectos(
  id_estado INT PRIMARY KEY,
  tipo_estado TEXT
);

INSERT INTO tbEstadoProyectos(id_estado, tipo_estado) VALUES 
(1, 'Activo'),
(2, 'Inactivo');

-- Tabla Proyectos
CREATE TABLE tbProyectos(
  id_Proyecto VARCHAR(7) PRIMARY KEY,
  nombre_Proyecto TEXT,
  link_google_sites TEXT,
  Id_Nivel INT,
  Id_SeccionGrupo INT,
  id_estado INT,
  Id_Especialidad INT NULL,
  FOREIGN KEY(Id_Nivel) REFERENCES tbNivel(Id_Nivel)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(Id_SeccionGrupo) REFERENCES tbSeccionGrupo(Id_SeccionGrupo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(id_estado) REFERENCES tbEstadoProyectos(id_estado)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(Id_Especialidad) REFERENCES tbEspecialidad(Id_Especialidad)
    ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado) VALUES 
('CA01-25', 'Ambilight', 'https://sites.google.com/ricaldone.edu.sv/CA01-25', 3, 1, 1),
('CD01-25', 'Cinematografía', 'https://sites.google.com/ricaldone.edu.sv/CD01-25', 3, 4, 1),
('BA01-25', 'Simulador de Frecuencias', 'https://sites.google.com/ricaldone.edu.sv/BA01-25', 2, 1, 1);

INSERT INTO tbProyectos (id_Proyecto, nombre_Proyecto, link_google_sites, Id_Nivel, Id_SeccionGrupo, id_estado, Id_Especialidad) VALUES 
('C101-25', 'The Friendly Pet', 'https://sites.google.com/ricaldone.edu.sv/C101-25', 4, 7, 1, 6),
('D301-25', 'Kairo Detalles', 'https://sites.google.com/ricaldone.edu.sv/D301-25', 6, 7, 1, 3);

-- Tabla Estudiantes
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
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(Id_SeccionGrupo) REFERENCES tbSeccionGrupo(Id_SeccionGrupo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(Id_Especialidad) REFERENCES tbEspecialidad(Id_Especialidad)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(id_Proyecto) REFERENCES tbProyectos(id_Proyecto)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla Actividades
CREATE TABLE tbActividad(
  Id_Actividad INT AUTO_INCREMENT PRIMARY KEY,
  Titulo_Actividad TEXT,
  Fecha_Inicio DATE,
  Fecha_Fin DATE
);

INSERT INTO tbActividad (Titulo_Actividad, Fecha_Inicio, Fecha_Fin) VALUES
('Introducción al Proyecto Técnico Científico', '2025-01-13', '2025-01-17'),
('Presentación de anteproyecto', '2025-01-31', '2025-02-07');

-- Tabla Etapas
CREATE TABLE tbEtapa(
  id_etapa INT PRIMARY KEY,
  porcentaje_etapa TEXT,
  fecha_inicio DATE,
  fecha_fin DATE
);

INSERT INTO tbEtapa (id_etapa, porcentaje_etapa, fecha_inicio, fecha_fin) VALUES
(1, 'Anteproyecto', '2025-01-09', '2025-01-16'),
(2, '30%', '2025-01-17', '2025-01-18'),
(3, '50%', '2025-01-19', '2025-01-20'),
(4, '80%', '2025-01-21', '2025-01-22'),
(5, '100%', '2025-01-23', '2025-01-24');

-- Tipo de evaluación
CREATE TABLE tbTipoEvaluacion (
  id_TipoEvaluacion INT PRIMARY KEY,
  nombre_TipoEvaluacion TEXT
);

INSERT INTO tbTipoEvaluacion (id_TipoEvaluacion, nombre_TipoEvaluacion) VALUES
(1, 'Escala estimativa'),
(2, 'Rúbrica');

-- Tabla Rúbricas
CREATE TABLE tbRubrica (
  id_Rubrica INT AUTO_INCREMENT PRIMARY KEY,
  nombre_Rubrica TEXT,
  Id_Nivel INT,
  Id_Especialidad INT,
  Año TEXT,
  id_etapa INT,
  id_TipoEvaluacion INT,
  FOREIGN KEY (id_etapa) REFERENCES tbEtapa (id_etapa) 
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_TipoEvaluacion) REFERENCES tbTipoEvaluacion (id_TipoEvaluacion) 
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla Criterios
CREATE TABLE tbCriterios (
  id_Criterio INT AUTO_INCREMENT PRIMARY KEY,
  id_Rubrica INT,
  nombre_Criterio TEXT,
  descripcion_Criterio TEXT,
  puntaje_Criterio DOUBLE,
  ponderacion_Criterio DOUBLE,
  FOREIGN KEY (id_Rubrica) REFERENCES tbRubrica (id_Rubrica) 
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla Evaluaciones
CREATE TABLE tbEvaluaciones (
  id_Evaluacion INT PRIMARY KEY AUTO_INCREMENT,
  id_Proyecto VARCHAR(7),
  id_Rubrica INT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_Proyecto) REFERENCES tbProyectos(id_Proyecto)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_Rubrica) REFERENCES tbRubrica(id_Rubrica)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Detalle Evaluaciones
CREATE TABLE tbDetalleEvaluaciones (
  id_DetalleEvaluacion INT PRIMARY KEY AUTO_INCREMENT,
  id_Evaluacion INT,
  id_Criterio INT,
  puntaje_obtenido DECIMAL(5,2),
  FOREIGN KEY (id_Evaluacion) REFERENCES tbEvaluaciones(id_Evaluacion)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_Criterio) REFERENCES tbCriterios(id_Criterio)
    ON UPDATE CASCADE ON DELETE CASCADE
);
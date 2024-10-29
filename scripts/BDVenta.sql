-- Crear la base de datos
CREATE DATABASE control_ventas_deudas;
\c control_ventas_deudas;

-- Tabla: Clientes
CREATE TABLE Clientes (
    clienteid SERIAL PRIMARY KEY,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(50),
    direccion VARCHAR(250),
    fecharegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Productos
CREATE TABLE Productos (
    productoid SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(50)
);

-- Tabla: Usuarios
CREATE TABLE Usuarios (
    usuarioid SERIAL PRIMARY KEY,
    nombreusuario VARCHAR(50),
    clave TEXT,
    estadousuario BOOLEAN,
    fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Ventas
CREATE TABLE Ventas (
    ventaid SERIAL PRIMARY KEY,
    clienteid INT,
    usuarioid INT,
    fechaventa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipoventa VARCHAR(10) DEFAULT 'Pendiente',
    observacion VARCHAR(300) DEFAULT '',
    CONSTRAINT fk_ventas_clientes FOREIGN KEY (clienteid) REFERENCES Clientes(clienteid),
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (usuarioid) REFERENCES Usuarios(usuarioid)
);

-- Tabla: DetalleVentas
CREATE TABLE DetalleVentas (
    detalleventaid SERIAL PRIMARY KEY,
    ventaid INT,
    productoid INT,
    cantidad INT NOT NULL,
    preciounitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_detalle_ventas_ventas FOREIGN KEY (ventaid) REFERENCES Ventas(ventaid),
    CONSTRAINT fk_detalle_ventas_productos FOREIGN KEY (productoid) REFERENCES Productos(productoid)
);

-- Tabla: Deudas
CREATE TABLE Deudas (
    deudaid SERIAL PRIMARY KEY,
    clienteid INT,
    ventaid INT,
    montodeuda DECIMAL(10, 2) NOT NULL,
    estadodeudas VARCHAR(10) DEFAULT 'Pendiente',
    fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deudas_clientes FOREIGN KEY (clienteid) REFERENCES Clientes(clienteid),
    CONSTRAINT fk_deudas_ventas FOREIGN KEY (ventaid) REFERENCES Ventas(ventaid)
);

-- Tabla: Pagos
CREATE TABLE Pagos (
    pagoid SERIAL PRIMARY KEY,
    deudaid INT,
    montoabono DECIMAL(10, 2) NOT NULL,
    fechapago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipopago character varying(10) COLLATE pg_catalog."default" DEFAULT 'Parcial'::character varying,
    CONSTRAINT fk_pagos_deudas FOREIGN KEY (deudaid) REFERENCES Deudas(deudaid)
);

-- Crear la base de datos
CREATE DATABASE control_ventas_deudas;
\c control_ventas_deudas;

-- Tabla: Clientes
CREATE TABLE Clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(50),
    direccion VARCHAR(250),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Productos
CREATE TABLE Productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(50)
);

-- Tabla: Usuarios
CREATE TABLE Usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50),
    clave TEXT,
    estado_usuario BOOLEAN,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Ventas
CREATE TABLE Ventas (
    venta_id SERIAL PRIMARY KEY,
    cliente_id INT,
    usuario_id INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_venta VARCHAR(10) DEFAULT 'Pendiente',
    observacion VARCHAR(300) DEFAULT '',
    CONSTRAINT fk_ventas_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(cliente_id),
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
);

-- Tabla: DetalleVentas
CREATE TABLE DetalleVentas (
    detalle_venta_id SERIAL PRIMARY KEY,
    venta_id INT,
    producto_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_detalle_ventas_ventas FOREIGN KEY (venta_id) REFERENCES Ventas(venta_id),
    CONSTRAINT fk_detalle_ventas_productos FOREIGN KEY (producto_id) REFERENCES Productos(producto_id)
);

-- Tabla: Deudas
CREATE TABLE Deudas (
    deuda_id SERIAL PRIMARY KEY,
    cliente_id INT,
    venta_id INT,
    monto_deuda DECIMAL(10, 2) NOT NULL,
    estado_deudas VARCHAR(10) DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deudas_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(cliente_id),
    CONSTRAINT fk_deudas_ventas FOREIGN KEY (venta_id) REFERENCES Ventas(venta_id)
);

-- Tabla: Pagos
CREATE TABLE Pagos (
    pago_id SERIAL PRIMARY KEY,
    deuda_id INT,
    monto_abono DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagos_deudas FOREIGN KEY (deuda_id) REFERENCES Deudas(deuda_id)
);

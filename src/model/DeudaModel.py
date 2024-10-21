from flask import Flask, jsonify
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import json

#objeto
from .entities.Venta import Venta
from .entities.DetalleVenta import DetalleVenta
from .entities.Deuda import Deuda

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

class DeudaModel:

    #Obtener todas las deudas
    @classmethod
    def get_sales(self):
        "Obtener todas las deudas"
        try:
            ListaVentas = []
            ventas = db.execute(text("SELECT * FROM dbo.obtenerdeudas()")).fetchall()
            db.commit()

            # Formatear los resultados en una lista
            for venta in ventas:
                ListaVentas.append({
                    'deudaid': venta[0],
                    'ventaid': venta[1],
                    'clienteid': venta[2],
                    'nombres' : venta[3],
                    'apellidos' : venta[4],
                    'fechaventa': venta[5].strftime('%d-%m-%Y %H:%M'),
                    'montodeuda': float(venta[6]),
                    'estadodeuda': venta[7]
                })
            return ListaVentas
        except Exception as ex:
            raise Exception(ex)
        
    #Obtener los detalles de las ventas
    @classmethod
    def get_productos_by_sales(cls, ventaid):
        """Obtener los productos asociados a una venta específica"""
        try:
            query = text("SELECT * FROM dbo.obtenerproductosporventa(:ventaid)")
            productos = db.execute(query, {"ventaid": ventaid}).fetchall()

            db.commit()

            # Convertir los resultados a una lista de diccionarios
            lista_productos = [
                {
                    'productoid': producto[0],
                    'nombre': producto[1],
                    'descripcion': producto[2],
                    'cantidad': producto[3],
                    'preciounitario': float(producto[4])
                }
                for producto in productos
            ]
            
            return lista_productos
        except Exception as ex:
            db.rollback()
            raise Exception(f"Error obteniendo los productos de la venta: {ex}")
        
    @classmethod
    def registrar_pago(cls, clienteid, montoabono):
        try:
            # Ejecutar el procedimiento almacenado con los parámetros
            db.execute(
                text("CALL dbo.registrar_pago(:clienteid, :montoabono)"),
                {"clienteid": clienteid, "montoabono": montoabono}
            )
            db.commit()

            return 1  # Éxito
        except Exception as ex:
            db.rollback()
            raise Exception(f"Error al registrar el pago: {ex}")
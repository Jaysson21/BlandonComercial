from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
#objeto
from .entities.Venta import Venta

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

class VentaModel:

    @classmethod
    def get_sales(self):
        "Obtener todas las ventas"
        try:
            ListaVentas = []
            ventas = db.execute(text("SELECT * FROM dbo.obtenerventas()")).fetchall()
            db.commit()

            # Formatear los resultados en una lista
            for venta in ventas:
                ListaVentas.append({
                    'ventaid': venta[0],
                    'clienteid': venta[1],
                    'nombres' : venta[2],
                    'apellidos' : venta[3],
                    'fechaventa': venta[4],
                    'tipoventa': venta[5],
                    'observacion': venta[6],
                    'estadoventa': venta[7],
                    'montoventa': venta[8]

                })

            return ListaVentas
        except Exception as ex:
            raise Exception(ex)
        

    from sqlalchemy.sql import text

    @classmethod
    def get_salescustomer(cls, clienteid):
        """Obtener las ventas filtradas por cliente"""
        try:
            ListaVentasCustomer = []

            # Llamar a la función almacenada pasándole el clienteid como parámetro
            query = text("SELECT * FROM dbo.obtenerventasporcliente(:clienteid)")
            ventas = db.execute(query, {"clienteid": clienteid}).fetchall()

            db.commit()

            # Formatear los resultados en una lista de diccionarios
            for venta in ventas:
                ListaVentasCustomer.append({
                    'ventaid': venta[0],
                    'clienteid': venta[1],
                    'nombres' : venta[2],
                    'apellidos' : venta[3],
                    'fechaventa': venta[4],
                    'tipoventa': venta[5],
                    'observacion': venta[6],
                    'estadoventa': venta[7],
                    'montoventa': venta[8]
                })

            return ListaVentasCustomer

        except Exception as ex:
            db.rollback()
            raise Exception(f"Error obteniendo las ventas del cliente: {ex}")

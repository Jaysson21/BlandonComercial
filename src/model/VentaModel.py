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
            ventas = db.execute(text("SELECT * FROM dbo.ventas ORDER BY ventaid")).fetchall()
            db.commit()

            # Formatear los resultados en una lista
            for venta in ventas:
                ListaVentas.append({
                    'ventaid': venta[0],
                    'clienteid': venta[1],
                    'usuarioid': venta[2],
                    'fechaventa': venta[3],
                    'tipoventa': venta[4],
                    'observacion': venta[5]
                })

            return ListaVentas
        except Exception as ex:
            raise Exception(ex)
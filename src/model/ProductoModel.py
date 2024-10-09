from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
#objeto
from .entities.Producto import Producto

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

class ProductoModel():

    @classmethod
    def get_products(self):
        try:
            ListaProducto=[]
            
            productoCSL = db.execute(text(
                "SELECT * FROM dbo.obtenerproductos()")).fetchall()

            # Extraer los resultados
            db.commit()
            
            # Formatear los resultados en un diccionario
            for i in range(len(productoCSL)):
                ListaProducto.append([productoCSL[i][0],productoCSL[i][1],
                            productoCSL[i][2]])
                i+=1

            return ListaProducto
        except Exception as ex:
            raise Exception(ex)
        

    @classmethod
    def get_productById(self, name):
        try:
            usuario = db.execute(text("SELECT * FROM dbo.buscar_producto(:nombre)"),
                {'nombre': name}
            ).fetchall()

            # Extraer los resultados
            db.commit()

            return usuario
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def add_product(self, producto):
        try:
            # Ejecutar el procedimiento almacenado para crear un Producto
            db.execute(
                text("CALL dbo.guardar_producto(:nombre, :descripcion)"),
                producto.to_json()
            )
            # Confirmar la transacción (ya que estamos insertando datos)
            db.commit()

            return 1
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def update_product(self, producto):
        try:
            db.execute(
                text("CALL dbo.actualizar_producto(:producto_id, :nombre, :descripcion)"),
                {
                 'producto_id': producto["produtoid"],
                 'nombre': producto["nombre"],
                 'descripcion': producto["descripcion"]
                }
            )
            db.commit()

            return 1
        except Exception as ex:
            raise Exception(ex)


    @classmethod
    def delete_product(self, id):
        try:
            db.execute(
                text("CALL dbo.eliminar_producto(:producto_id)"),
                {'producto_id': id}
            )

            db.commit()
            return 1
        except Exception as ex:
            raise Exception(ex)
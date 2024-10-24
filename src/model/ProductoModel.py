from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
#objeto
from .entities.Producto import Producto


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
            lista_productos=[]
            
            productoCSL = db.execute(text(
                "SELECT * FROM dbo.obtenerproductos()")).fetchall()

            # Extraer los resultados
            db.commit()
            
            # Formatear los resultados en un diccionario
             # Convertir cada producto en un diccionario
            for producto in productoCSL:
                producto_dict = {
                    "productoid": str(producto[0]),   # Asegúrate de que los nombres de las claves coincidan con los campos reales
                    "nombre": producto[1],
                    "descripcion": producto[2]
                }
                lista_productos.append(producto_dict)
           
            return lista_productos
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
    def update_product(cls, producto):
        try:
            db.execute(
                text("CALL dbo.actualizar_producto(:productoid, :nombre, :descripcion)"),
                {
                 'productoid': producto.productoid,
                 'nombre': producto.nombre,
                 'descripcion': producto.descripcion
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
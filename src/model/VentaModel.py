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


    @staticmethod
    def saveSale(cliente_id, usuario_id, tipo_venta, productos, observacion):
        try:
            # Convertir los productos a formato JSON para pasarlos al procedimiento almacenado
            productos_json = json.dumps(productos)  # Serializar la lista de productos como JSON
            
            # Ejecutar el procedimiento almacenado
            result = db.execute(text("CALL dbo.registrar_venta(:p_cliente_id, :p_usuario_id, :p_tipo_venta, :p_productos, :p_observacion)"), {
                'p_cliente_id': cliente_id,
                'p_usuario_id': usuario_id,
                'p_tipo_venta': tipo_venta,
                'p_productos': productos_json,
                'p_observacion': observacion
            })

            db.commit()  # Confirmar la transacción

            return jsonify({"status": "success", "mensaje": "Venta registrada correctamente."}), 201

        except SQLAlchemyError as e:
            db.rollback()  # Revertir la transacción si hay errores
            print("Error de SQLAlchemy:", str(e))  # Imprimir el error en la consola
            return jsonify({"status": "error", "mensaje": str(e)}), 500

        except Exception as ex:
            print("Error inesperado:", str(ex))  # Imprimir el error en la consola
            return jsonify({"status": "error", "mensaje": "Error al procesar la venta: " + str(ex)}), 500

# Función para validar los datos de la venta
def validar_datos_venta(cliente_id, usuario_id, tipo_venta, productos):
    if not cliente_id or not usuario_id:
        return False, "El ID del cliente y del usuario son obligatorios."
    
    if not productos or len(productos) == 0:
        return False, "Debe haber al menos un producto en la venta."

    if tipo_venta not in ['Contado', 'Credito']:
        return False, "El tipo de venta debe ser 'Contado' o 'Credito'."

    for producto in productos:
        if 'productoid' not in producto or 'cantidad' not in producto or 'preciounitario' not in producto:
            return False, "Cada producto debe tener un ID, cantidad y precio unitario."

        if producto['cantidad'] <= 0 or producto['precio'] <= 0:
            return False, "La cantidad y el precio unitario deben ser mayores que cero."
    
    return True, ""
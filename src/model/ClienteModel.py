from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
#Objeto
from .entities.Cliente import Cliente

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

class ClienteModel:

    @classmethod
    def get_clients(self):
        """Obtener todos los clientes."""
        try:
            ListaClientes = []
            clientes = db.execute(text("SELECT * FROM dbo.clientes")).fetchall()
            db.commit()

            # Formatear los resultados en una lista
            for cliente in clientes:
                ListaClientes.append({
                    'clienteid': cliente[0],
                    'nombres': cliente[1],
                    'apellidos': cliente[2],
                    'telefono': cliente[3],
                    'email': cliente[4],
                    'direccion': cliente[5],
                    'fecharegistro': cliente[6]
                })

            return ListaClientes
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def get_clientById(self, clienteid):
        """Obtener un cliente por su ID."""
        try:
            cliente = db.execute(text("SELECT * FROM dbo.clientes WHERE clienteid = :clienteid"),
                                 {'clienteid': clienteid}).fetchone()
            db.commit()

            if cliente:
                return {
                    'clienteid': cliente[0],
                    'nombres': cliente[1],
                    'apellidos': cliente[2],
                    'telefono': cliente[3],
                    'email': cliente[4],
                    'direccion': cliente[5],
                    'fecharegistro': cliente[6]
                }
            return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def add_client(self, cliente):
        """Agregar un nuevo cliente."""
        try:
            db.execute(
                text("CALL dbo.guardar_cliente(:nombres, :apellidos, :telefono, :email, :direccion)"),
                {
                    'nombres': cliente["nombres"],
                    'apellidos': cliente["apellidos"],
                    'telefono': cliente["telefono"],
                    'email': cliente["email"],
                    'direccion': cliente["direccion"]
                }
            )
            db.commit()
            return 1
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def update_client(self, cliente):
        """Actualizar un cliente existente."""
        try:
            db.execute(
                text("CALL dbo.actualizar_cliente(:clienteid, :nombres, :apellidos, :telefono, :email, :direccion)"),
                {
                    'clienteid': cliente["clienteid"],
                    'nombres': cliente["nombres"],
                    'apellidos': cliente["apellidos"],
                    'telefono': cliente["telefono"],
                    'email': cliente["email"],
                    'direccion': cliente["direccion"]
                }
            )
            db.commit()
            return 1
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def delete_client(self, clienteid):
        """Eliminar un cliente."""
        try:
            db.execute(
                text("CALL dbo.eliminar_cliente(:clienteid)"),
                {'clienteid': clienteid}
            )
            db.commit()
            return 1
        except Exception as ex:
            raise Exception(ex)
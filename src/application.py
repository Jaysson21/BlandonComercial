from flask import Flask, render_template, jsonify, request, flash, redirect, sessions
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
import uuid
import requests

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    if 'username' in session:
        return render_template("index.html", username=session["username"])
    else:
        return render_template("login.html", username='null')



@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        username = request.form.get("nombre_usuario")
        password = request.form.get("pass")

        if not request.form.get("nombre_usuario"):
            flash('Ingrese un nombre de usuario')
            return redirect("/login")

        # Ensure password was submitted
        elif not request.form.get("pass"):
            flash('Ingrese una contraseña')
            return redirect("/login")
        
        #consulta api
        try:
            # Ejecutar el procedimiento almacenado con SQLAlchemy
            usuario = db.execute(text(
                "SELECT * FROM dbo.usuarios WHERE nombreusuario = '"+username+"'")).fetchall()

            # Extraer los resultados
            db.commit()
            # Verificar si se encontró algún usuario
            if usuario is None:
                return jsonify({"error": "Usuario no encontrado"}), 404

            # Formatear los resultados en un diccionario
            user = {
                "UsuarioID": usuario[0][0],
                "NombreUsuario": usuario[0][1],
                "clave": usuario[0][2],
                "EstadoUsuario": usuario[0][3],
                "FechaCreacion": usuario[0][4].isoformat(),  # Formatear la fecha a formato ISO
                "correo": usuario[0][5]
            }
            #jsonserializable
            # Ensure username exists and password is correct
            if usuario is None or not check_password_hash(user['clave'], password):
                flash('Contraseña Incorrecta')
                return redirect("/login")

            # Remember which user has logged in
            session["UsuarioID"] = user['UsuarioID']
            session["username"] = username
            #session["role_user"] = user[0]['role']

            return redirect('/')
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return render_template("login.html")


@app.route("/register", methods=["POST", "GET"])
def register():
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            flash("Ingrese un nombre de usuario")
            return redirect("/register")

        # Ensure password was submitted
        elif not request.form.get("clave"):
            flash("Ingrese una contraseña")
            return redirect("/register")



        data = {
                "nombre_usuario": request.form.get("username"),
                "clave": generate_password_hash(request.form.get("clave")),
                "estadoUsuario":request.form.get("estadoUsuario"),
                "correo": request.form.get("correo")
                }
        print('entra')
        #envio de datos a la api
        try:
            # Ejecutar el procedimiento almacenado para crear un usuario
            db.execute(
                text("CALL dbo.CrearUsuario(:nombre_usuario, :clave, :estado_usuario, :correo)"),
                {'nombre_usuario': data["nombre_usuario"], 'clave': data["clave"], 'estado_usuario':True,'correo': data["correo"]}
            )
            # Confirmar la transacción (ya que estamos insertando datos)
            db.commit()

            print(data)
            flash('¡Cuenta creada exitosamente!')
            # Redirect user to login page
            return redirect("/login")

        except Exception as e:
            db.rollback()  # Revertir la transacción en caso de error
            return jsonify({"error": str(e)}), 500

    else:
        return render_template('loginL.html')        


@app.route("/logout")
@login_required
def logout():
    session.clear()
    return redirect('/loginL.html')

@app.route("/GestionVentas")
def GestionVentas():
    return render_template("GestionVentas.html", username=session["username"])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
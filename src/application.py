from flask import Flask, render_template, jsonify, request, flash, redirect, sessions
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
import uuid
import requests

#models
from model.UsuarioModel import UsuarioModel 
from model.ProductoModel import ProductoModel
from model.ClienteModel import ClienteModel

#entities
from model.entities.Producto import Producto


app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    if 'username' in session:
        return render_template("index.html", username=session["username"], nameuser=session["nameUser"])
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
            usuario = UsuarioModel.get_userbyId(username)
            # Verificar si se encontró algún usuario
            if usuario is None:
                return redirect("/login")

            #jsonserializable
            # Ensure username exists and password is correct
            if usuario is None or not check_password_hash(usuario[0][2], password):
                flash('Contraseña Incorrecta')
                return redirect("/login")

            # Remember which user has logged in
            session["nameUser"] = usuario[0][1]
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
        
        #envio de datos a la api
        try:
            
            UsuarioModel.add_user(data)

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
    clientes = ClienteModel.get_clients()
    productos=ProductoModel.get_products()
    return render_template("GestionVentas.html", username=session["username"], clientes=clientes, productos=productos, nameuser=session["nameUser"])

#Productos
@app.route("/GestionProductos")
def GestionProductos():
    productos=ProductoModel.get_products()
    return render_template("GestionProductos.html", username=session["username"], productos=productos, nameuser=session["nameUser"] )

@app.route("/addProduct", methods=["POST"])
def addProduct():
    if request.method == "POST":
        nombre = request.form.get("nombreProducto")
        descripcion = request.form.get("descripcionProducto")

        if not request.form.get("nombreProducto"):
            flash('Ingrese un nombre de Producto')
            return redirect("/GestionProductos")
        
        if not request.form.get("descripcionProducto"):
            flash('Ingrese una descripcion del Producto')
            return redirect("/GestionProductos")
        
        #Añadir producto
        p = Producto(productoid=0,nombre=nombre,descripcion=descripcion)
        ProductoModel.add_product(p)

        return redirect("/GestionProductos")

@app.route("/deleteProduct/<id>")
def deleteProduct(id):
    #eliminar producto
    ProductoModel.delete_product(id)
    return redirect("/GestionProductos")
    

@app.route("/GestionCliente")
def GestionClientes():
    clientes = ClienteModel.get_clients()
    return render_template("GestionCliente.html", username=session["username"], clientes=clientes, nameuser=session["nameUser"])

@app.route("/GestionPagos")
def GestionPagos():
    clientes = ClienteModel.get_clients()
    return render_template("GestionPagos.html", username=session["username"], clientes=clientes, nameuser=session["nameUser"])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
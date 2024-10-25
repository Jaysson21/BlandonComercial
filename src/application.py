from flask import Flask, render_template, jsonify, request, flash, redirect, redirect, url_for, session, make_response
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import IntegrityError
from funciones import *
from datetime import datetime
from weasyprint import HTML
import json
import uuid


#models
from model.UsuarioModel import UsuarioModel 
from model.ProductoModel import ProductoModel
from model.ClienteModel import ClienteModel
from model.VentaModel import VentaModel
from model.DeudaModel import DeudaModel

#entities
from model.entities.Producto import Producto
from model.entities.Cliente import Cliente


app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#lista producto
ProductsList = []

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
            session["user_id"] = usuario[0][0]

            print(session["user_id"])

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

#***************************************************************************************************** PARA LAS VENTAS
@app.route("/GestionVentas")
def GestionVentas():
    clientes = ClienteModel.get_clients()
    actualizar_listaProd()
    return render_template("GestionVentas.html", username=session["username"], clientes=clientes, nameuser=session["nameUser"])

@app.route("/saveSale", methods=["POST", "GET"])
def saveSale():
    # Obtener los datos de la solicitud
    datos = request.json
    
    cliente_id = datos.get('cliente_id')
    usuario_id = session["user_id"]
    tipo_venta = datos.get('tipo_venta')
    productos = datos.get('productos')
    fechaVenta = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
    montoPagoInicial = datos.get('montoPagoInicial')
    observacion = datos.get('observacion')


    res = VentaModel.saveSale(cliente_id, usuario_id, tipo_venta, productos,montoPagoInicial, observacion,fechaVenta)

    return jsonify({"status": "success", "mensaje": "Venta registrada correctamente.", "NumFact":res}), 201

@app.route('/ver_factura/<int:venta_id>')
def ver_factura(venta_id):
    # Obtener la información de la venta y detalles
    venta = {
        'ventaid': venta_id,
        'fechaventa': '2024-10-19',
        'cliente': 'John Doe',
        'tipoventa': 'Contado',
        'observacion': 'Gracias por su compra'
    }
    detalles = [
        {'producto': 'Producto A', 'cantidad': 2, 'preciounitario': 50.0},
        {'producto': 'Producto B', 'cantidad': 1, 'preciounitario': 100.0},
    ]
    total_venta = sum(d['cantidad'] * d['preciounitario'] for d in detalles)
    #detalles = VentaModel.get_productos_by_sales(venta_id)  # Función personalizada para obtener detalles de la venta
    #total_venta = 100  # Función para calcular el total de la venta
    # Renderizamos el template HTML
    html_string = render_template('Factura.html', venta=venta, detalles=detalles, total_venta=total_venta)

    # Convertir el HTML a PDF
    pdf = HTML(string=html_string).write_pdf()

    # Crear la respuesta con el PDF en línea
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=factura_{venta_id}.pdf'

    return response

def setResFact(res):
    global NumFactura
    NumFactura=res

#***************************************************************************************************** PARA LOS PRODUCTOS
@app.route("/GestionProductos")
def GestionProductos():
    actualizar_listaProd()
    return render_template("GestionProductos.html", username=session["username"], productos=ProductsList, nameuser=session["nameUser"])

def actualizar_listaProd():
    global ProductsList
    ProductsList=ProductoModel.get_products()

@app.route('/buscar_producto', methods=["GET"])
def buscar_producto():
    query = request.args.get('query', '').lower()
    resultados = [p for p in ProductsList if query in p['nombre'].lower() or query in p['productoid']]
    return jsonify(resultados[:3])

@app.route("/addProduct", methods=["POST"])
def addProduct():
    if request.method == "POST":
        nombre = request.form.get("nombreProducto")
        descripcion = request.form.get("descripcionProducto")

        # Validaciones de campos
        if not nombre:
            return jsonify({'success': False, 'message': 'Ingrese un nombre de Producto'}), 400
        
        if not descripcion:
            return jsonify({'success': False, 'message': 'Ingrese una descripción del Producto'}), 400
        
        try:
            # Añadir producto a la base de datos
            p = Producto(productoid=0, nombre=nombre, descripcion=descripcion)
            ProductoModel.add_product(p)

            # Devolver respuesta de éxito
            return jsonify({'success': True, 'message': 'Producto agregado exitosamente'})

        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    
@app.route("/updateProduct/", methods=["POST"])
def updateProduct():
    if request.method == "POST":
        
        #Obtener datos del formulario
        productid = request.form.get("productid")
        nombre = request.form.get("nombreProducto")
        descripcion = request.form.get("descripcionProducto")

        #Valida Campos
        if not nombre or not descripcion:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios'}), 400
        
        try:
            #Editar producto
            p = Producto(productoid=productid,nombre=nombre,descripcion=descripcion)
            ProductoModel.update_product(p)
        except IntegrityError:
            return jsonify({'success': False, 'message': 'Error: La cédula ya está registrada.'})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})

        return jsonify({'success': True})
      
@app.route("/deleteProduct/<int:id>", methods=["POST"])
def deleteProduct(id):
    try:
        # Eliminar el producto de la base de datos
        ProductoModel.delete_product(id)
        return jsonify({'success': True, 'message': 'Producto eliminado exitosamente.'})

    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: Ha ocurrido un problema al eliminar el Producto. ' + str(e)})

    
#***************************************************************************************************** PARA LOS CLIENTES
@app.route("/GestionCliente")
def GestionClientes():
    clientes = ClienteModel.get_clients()
    return render_template("GestionCliente.html", username=session["username"], clientes=clientes, nameuser=session["nameUser"])

@app.route('/buscar_cliente', methods=["GET"])
def buscar_cliente():
    query = request.args.get('query', '').upper()
    resultados = ClienteModel.get_clientById(query)
    
    if resultados:
        return jsonify(resultados)
    else:
        flash('No se encontro registro del cliente')
        return jsonify({'success': False, 'message': 'No se encontro registro del cliente'}), 400

    

@app.route("/addClient", methods=["POST"])
def addClient():
    if request.method == "POST":
        # Obtener los datos del formulario
        nombres = request.form.get("nombreCliente")
        apellidos = request.form.get("apellidoCliente")
        cedula = request.form.get("cedulaCliente")
        telefono = request.form.get("telefonoCliente")
        direccion = request.form.get("direccionCliente")

        # Validar campos vacíos en una sola línea
        if not nombres or not apellidos or not telefono or not cedula or not direccion:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios'}), 400
        
        # Crear el objeto cliente
        c = Cliente(clienteid=0, nombres=nombres, apellidos=apellidos, cedula=cedula, telefono=telefono, direccion=direccion, fecharegistro=None)
        
        try:
            # Añadir cliente a la base de datos
            ClienteModel.add_client(c)
            flash('Cliente agregado exitosamente.', 'success')
        except IntegrityError:
            # Manejar error de cédula duplicada
            flash('Error: La cédula ya está registrada. Por favor revisa los datos.', 'error')
            return redirect("/GestionCliente")
        except Exception as e:
            # Manejar cualquier otro error
            flash('Error: Ha ocurrido un problema. Por favor, revisa los datos e intenta de nuevo.', 'error')
            return redirect("/GestionCliente")

        return redirect("/GestionCliente")


@app.route("/updateClient", methods=["POST"])
def updateClient():
    if request.method == "POST":
        # Obtener los datos del formulario
        clienteid = request.form.get("clienteid")
        nombres = request.form.get("nombreCliente")
        apellidos = request.form.get("apellidoCliente")
        telefono = request.form.get("telefonoCliente")
        cedula = request.form.get("cedulaCliente")
        direccion = request.form.get("direccionCliente")

        # Validar campos vacíos
        if not clienteid or not nombres or not apellidos or not telefono or not cedula or not direccion:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios'}), 400
        
        try:
            c = Cliente(clienteid=clienteid, nombres=nombres, apellidos=apellidos, telefono=telefono, cedula=cedula, direccion=direccion, fecharegistro=None)
            ClienteModel.update_client(c)

            return jsonify({'success': True, 'message': 'Cliente actualizado exitosamente'})
        
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error al actualizar el cliente: {str(e)}'}), 500


@app.route("/deleteClient/<int:id>", methods=["POST"])
def deleteClient(id):
    try:
        # Eliminar el producto de la base de datos
        ClienteModel.delete_client(id)
        return jsonify({'success': True, 'message': 'Cleinte eliminado exitosamente.'})

    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: Ha ocurrido un problema al eliminar el Cliente. ' + str(e)})

#***************************************************************************************************** PARA LOS PAGOS
@app.route("/GestionDeudas")
def GestionDeudas():
    clientes = ClienteModel.get_clients()
    deudas = DeudaModel.get_sales()
    return render_template("GestionDeudas.html", username=session["username"], clientes=clientes, deudas_json = json.dumps(deudas), nameuser=session["nameUser"])

@app.route("/detallesVentas/<int:ventaid>", methods=["GET"])
def get_products_by_sale(ventaid):
    try:
        productos = DeudaModel.get_productos_by_sales(ventaid)
        return jsonify({'success': True, 'productos': productos})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    
@app.route("/registrarPago", methods=["POST"])
def registrar_pago():
    # Obtener los datos de la solicitud
    datos = request.json
    clienteid = datos.get("clienteid")
    montoabono = datos.get("montoabono")

    try:
        # Llamar a la función registrar_pago del modelo
        DeudaModel.registrar_pago(clienteid, montoabono)
        return jsonify({"success": True, "message": "Pago registrado exitosamente"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

    
#*******************************************************************************************************PARA LOS REPORTES
@app.route("/GestionReportes")
def GestionReportes():
    clientes = ClienteModel.get_clients()
    deudas = DeudaModel.get_sales()
    ventas = VentaModel.get_sales()
    return render_template("ReporteVenta.html", username=session["username"], clientes=clientes, ventas=ventas, deudas_json = json.dumps(deudas), nameuser=session["nameUser"])


#*******************************************************************************************************
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
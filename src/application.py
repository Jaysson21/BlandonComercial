from flask import Flask, render_template, jsonify, request, flash, redirect, redirect, url_for, session, make_response
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import IntegrityError
from funciones import *
from datetime import datetime
from weasyprint import HTML, CSS
from datetime import datetime
import pytz

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
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#lista producto
ProductsList = []

@app.route("/")
def index():
    if 'username' in session:
        #print(uuid.uuid4())
        return redirect('/GestionVentas')
        #return render_template("index.html", username=session["username"], nameuser=session["nameUser"])
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
    return redirect('/')

#***************************************************************************************************** PARA LAS VENTAS
@app.route("/GestionVentas")
def GestionVentas():
    clientes = ClienteModel.get_clients()
    ventas_pendientes = VentaModel.get_salesPending()
    actualizar_listaProd()
    return render_template("GestionVentas.html", username=session["username"], clientes=clientes, nameuser=session["nameUser"], pendienteEntregas=ventas_pendientes)

@app.route("/deliverOrder/<int:ventaid>", methods=["POST", "GET"])
def deliverOrder(ventaid):
    VentaModel.deliverOrder(ventaid)
    return jsonify({"status": "success", "mensaje": "pedido entregado correctamente."}), 201

@app.route("/saveSale", methods=["POST", "GET"])
def saveSale():
    # Obtener los datos de la solicitud
    datos = request.json
    # Define la zona horaria de Nicaragua
    nicaragua_timezone = pytz.timezone('America/Managua')

    # Obtiene la hora actual en la zona horaria de Nicaragua
    nicaragua_time = datetime.now(nicaragua_timezone).strftime('%Y-%m-%d %H:%M:%S.%f')
    
    cliente_id = datos.get('cliente_id')
    usuario_id = session["user_id"]
    tipo_venta = datos.get('tipo_venta')
    tipo_entrega = datos.get('tipo_entrega')
    productos = datos.get('productos')
    fechaVenta = nicaragua_time
    montoPagoInicial = datos.get('montoPagoInicial')
    observacion = datos.get('observacion')

    res = VentaModel.saveSale(cliente_id, usuario_id, tipo_venta, tipo_entrega, productos,montoPagoInicial, observacion,fechaVenta)

    return jsonify({"status": "success", "mensaje": "Venta registrada correctamente.", "NumFact":res}), 201

@app.route("/deleteSale/<int:id>", methods=["POST"])
def deleteSale(id):
    try:
        # Eliminar la venta de la base de datos
        VentaModel.delete_sale(id)
        return jsonify({'success': True, 'message': 'Venta eliminado exitosamente.'})

    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: Ha ocurrido un problema al eliminar la venta. ' + str(e)})

@app.route('/ver_factura/<int:venta_id>/<int:tienePagoIncial>')
def ver_factura(venta_id, tienePagoIncial):
    alturaFactura = 100 #altura inicial factura 100mm

    # Obtener la información de la venta y detalles
    venta = VentaModel.get_salesById(venta_id, tienePagoIncial)
    detalles = VentaModel.get_productos_by_sales(venta_id)
     
    total_venta = sum(d['cantidad'] * d['preciounitario'] for d in detalles)


    for d in detalles:
        alturaFactura += 5

    # Renderizamos el template HTML
    html_string = render_template('Factura.html', venta=venta, detalles=detalles, total_venta=total_venta, pagoInicial=venta['montoPago'])

    # Convertir el HTML a PDF
    css = CSS(string="""
              @page { width: 78mm; margin: 0; height:"""+str(alturaFactura)+"""mm; crop: none;}
              body, html { width: 80mm; margin: 2px; padding: 0; height: auto;}
              """)
 
    pdf = HTML(string=html_string).write_pdf(stylesheets=[css])

    # Crear la respuesta con el PDF en línea
    response = make_response(pdf)
    
    #response.headers['Content-Disposition'] = 'inline; filename=Factura_'+str(venta_id)+'.pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=Factura_{venta_id}.pdf'

    response.headers['Content-Type'] = 'application/pdf'

    return response

@app.route('/ver_recibo/<int:cliente_id>/<montoPago>/<tipoPago>')
def ver_recibo(cliente_id, montoPago, tipoPago):
    # Define la zona horaria de Nicaragua
    nicaragua_timezone = pytz.timezone('America/Managua')

    # Obtiene la hora actual en la zona horaria de Nicaragua
    nicaragua_time = datetime.now(nicaragua_timezone).strftime('%d-%m-%Y %H:%M:%S')

    Fecha = nicaragua_time
    cliente = ClienteModel.get_clientByID(cliente_id)
    cedula = cliente['cedula']
    nombre = cliente['nombres']+' '+cliente['apellidos']
    referencia=str(uuid.uuid4())[:8]
    deuda = DeudaModel.get_saleByClient(clienteid=cliente_id)
    MontoDeuda = f"C${deuda:,.2f}"

    # Renderizamos el template HTML
    html_string = render_template('Recibo.html', cedula=cedula, nombre=nombre, fecha=Fecha, montoPago=montoPago, tipoPago=tipoPago, referencia=referencia, deuda=MontoDeuda)

    # Convertir el HTML a PDF
    css = CSS(string="""
              @page { size: 80mm auto; margin: 0; height: 100mm;}
              body, html { width: 80mm; margin: 2px; padding: 0; height: auto;}
              """)  # Ancho de 80mm
    pdf = HTML(string=html_string).write_pdf(stylesheets=[css])

    # Crear la respuesta con el PDF en línea
    response = make_response(pdf)
    
    #response.headers['Content-Disposition'] = 'inline; filename=Factura_'+str(venta_id)+'.pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=Recibo_{cedula}.pdf'

    response.headers['Content-Type'] = 'application/pdf'

    return response

@app.route('/ver_ticketCarga')
def ver_ticket_carga():
    alturaTicket = 50 #cantidad inicial de 50mm

    # Define la zona horaria de Nicaragua
    nicaragua_timezone = pytz.timezone('America/Managua')

    # Obtiene la hora actual en la zona horaria de Nicaragua
    nicaragua_time = datetime.now(nicaragua_timezone).strftime('%d-%m-%Y %H:%M:%S')

    Fecha = nicaragua_time
    cantidadProductos = 0
    flag = 0
    productos_json = json.loads(request.args.get('productos'))
    id = uuid.uuid4()

    for p in productos_json:
        cantidadProductos += int(p['cantidad'])
        flag += 1

    alturaTicket += (flag * 6)

    # Renderizamos el template HTML
    html_string = render_template(
        'TicketCarga.html', 
        productos=productos_json, 
        cantidadProductos=cantidadProductos, 
        fechaCarga=Fecha
    )

    # Configura el CSS para el tamaño de 80 mm de ancho
    css = CSS(string="""
        @page { width: 79mm; margin: 0; height: """+str(alturaTicket)+"""mm;} /* 80 mm de ancho y altura auto */
        body, html { margin: 2px; padding: 0;}
    """)

    # Genera el PDF
    pdf = HTML(string=html_string).write_pdf(stylesheets=[css])

    # Crear la respuesta con el PDF en línea
    response = make_response(pdf)
    response.headers['Content-Disposition'] = f'attachment; filename=TicketCarga_{id}.pdf'
    response.headers['Content-Type'] = 'application/pdf'

    return response

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

    
@app.route("/updateProduct", methods=["POST"])
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

    if request.args.get('filtroBusClient') == '1':
        query = request.args.get('query', '').upper()
        resultados = ClienteModel.get_clientById(query)

        if resultados:
            return jsonify(resultados)
        else:
            flash('No se encontro registro del cliente')
            return jsonify({'success': False, 'message': 'No se encontro registro del cliente'}), 400
    elif  request.args.get('filtroBusClient') == '2':
        query = request.args.get('query', '').upper()
        resultados = ClienteModel.get_clientByName(query)
        
        if resultados:
            return jsonify(resultados)
        else:
            flash('No se encontro registro del cliente')
            return jsonify({'success': False, 'message': 'No se encontro registro del cliente'}), 400
    else:
        query = request.args.get('query', '').upper()
        resultados = ClienteModel.get_clientByTelf(query)

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
    
@app.route("/getHistorialPagos/<int:clienteid>", methods=["GET"])
def get_historial_pagos(clienteid):
    try:
        historialpagos = DeudaModel.get_pagosby_client(clienteid)
        
        return jsonify({"success": True, "historial": historialpagos})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route("/deletePago/<int:id>", methods=["POST"])
def deletePago(id):
    try:
        # Eliminar el producto de la base de datos
        DeudaModel.delete_Pago(id)
        return jsonify({'success': True, 'message': 'Cleinte eliminado exitosamente.'})

    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: Ha ocurrido un problema al eliminar el Cliente. ' + str(e)})

    
#*******************************************************************************************************PARA LOS REPORTES
@app.route("/GestionReportes")
def GestionReportes():
    clientes = ClienteModel.get_clients()
    ventas = VentaModel.get_sales()
    return render_template("Reportes.html", username=session["username"], clientes=clientes, ventas=ventas, nameuser=session["nameUser"])

@app.route("/GestionReportes/Productos", methods=["GET"])
def GestionReporteProductos():

    mes = request.args.get('mes')
    anio = request.args.get('anio')

    if mes and anio:
        try:
            
            topproductos = ProductoModel.get_productsby_monthyear(int(mes), int(anio))
            return jsonify(topproductos)
        except Exception as ex:
            return jsonify({"error": str(ex)}), 500
    else:
        return render_template("ReporteProductos.html", username=session["username"], nameuser=session["nameUser"])

@app.route("/GestionReportes/Carga", methods=["GET"])
def GestionReporteCarga():
    fecha_hora_inicio = request.args.get('fecha_hora_inicio')  # Captura la fecha y hora de inicio
    fecha_fin = request.args.get('fecha_fin')  # Captura la fecha de fin (opcional)

    # Si fecha_fin es una cadena vacía, asigna None
    if not fecha_fin:
        fecha_fin = None

    if fecha_hora_inicio:
        # Llamada al modelo con fecha_hora_inicio y fecha_fin (None si no se proporciona fecha de fin)
        productocarga = ProductoModel.report_carga(fecha_hora_inicio, fecha_fin)
        return jsonify(productocarga)
        
    else:
        # Caso 2: Parámetros insuficientes
        return render_template("ReporteCarga.html", username=session["username"], nameuser=session["nameUser"])

@app.route("/userRegistro", methods=["GET"])
def registro():
    return render_template("registro.html")

@app.route("/GestionReportes/Ventas", methods=["GET"])
def GestionReporteVenta():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    if fecha_inicio and fecha_fin:
        ventas_historicas = VentaModel.get_sales_historica(fecha_inicio, fecha_fin)
        return jsonify(ventas_historicas)
    
    elif fecha_inicio and not fecha_fin:
        ventas_historicas = VentaModel.get_sales_historica(fecha_inicio)
        return jsonify(ventas_historicas)
    
    else:
        return render_template("ReporteVentas.html", username=session.get("username"), nameuser=session.get("nameUser"))
    
@app.route("/GestionReportes/Deudas")
def GestionReportesDeudas():
    deudas = DeudaModel.get_debts_report()
    total_deuda = sum(deuda["montodeuda"] for deuda in deudas)
    return render_template("ReporteDeudas.html", username=session["username"], deudas=deudas, total_deuda=total_deuda, nameuser=session["nameUser"])

@app.route("/GestionReportes/Utilidades")
def GestionReportesUtilidades():
    fecha_hora_inicio = request.args.get('fecha_inicio')  # Captura la fecha y hora de inicio
    fecha_fin = request.args.get('fecha_fin')  # Captura la fecha de fin (opcional)

    # Si fecha_fin es una cadena vacía, asigna None
    if not fecha_fin:
        fecha_fin = None

    if fecha_hora_inicio:
        # Llamada al modelo con fecha_hora_inicio y fecha_fin (None si no se proporciona fecha de fin)
        productocarga = ProductoModel.report_carga(fecha_hora_inicio, fecha_fin)
        return jsonify(productocarga)
        
    else:
        # Caso 2: Parámetros insuficientes
        return render_template("ReporteUtilidades.html", username=session["username"], nameuser=session["nameUser"])
#*******************************************************************************************************
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
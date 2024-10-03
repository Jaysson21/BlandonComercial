class Cliente:
    def __init__(self, clienteid, nombres, apellidos, telefono, email, direccion, fecharegistro):
        self.clienteid = clienteid
        self.nombres = nombres
        self.apellidos = apellidos
        self.telefono = telefono
        self.email = email
        self.direccion = direccion
        self.fecharegistro = fecharegistro

    def to_json(self):
        return {
            'clienteid': self.clienteid,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'telefono': self.telefono,
            'email': self.email,
            'direccion': self.direccion,
            'fecharegistro': self.fecharegistro
        }

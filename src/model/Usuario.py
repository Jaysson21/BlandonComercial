class Usuario:
    def __init__(self, usuarioid, nombreusuario, clave, estadousuario, fechacreacion, correo):
        self.usuarioid = usuarioid
        self.nombreusuario = nombreusuario
        self.clave = clave
        self.estadousuario = estadousuario
        self.fechacreacion = fechacreacion
        self.correo = correo

    def to_json(self):
        return {
            'usuarioid': self.usuarioid,
            'nombreusuario': self.nombreusuario,
            'clave': self.clave,
            'estadousuario': self.estadousuario,
            'fechacreacion': self.fechacreacion,
            'correo': self.correo
        }

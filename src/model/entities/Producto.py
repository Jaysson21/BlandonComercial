class Producto:
    def __init__(self, productoid, nombre, descripcion):
        self.productoid = productoid
        self.nombre = nombre
        self.descripcion = descripcion

    def to_json(self):
        return {
            'productoid': self.productoid,
            'nombre': self.nombre,
            'descripcion': self.descripcion
        }

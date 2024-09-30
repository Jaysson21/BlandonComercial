class users:
    def __init__(self,id_user,username=None,password=None,email=None,person=None,role=None,status_user=None):
        self.id_user=id_user
        self.username=username
        self.password=password
        self.email=email
        self.person=person
        self.role=role
        self.status_user=status_user

    def to_json(self):
        return {
            'id_user':self.id_user,
            'username':self.username,
            'password':self.password,
            'email':self.email,
            'person':self.person,
            'role':self.role,
            'status_user':self.status_user
        }
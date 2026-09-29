from django.db import models
from django.contrib.auth.models import AbstractUser

# Creation d'un login 

class CustomUser(AbstractUser):

    ROLE_CHOICE=(
        ('ADMIN','administrateur' ),
        ('ENSEIGNANT','enseignant'),
        ('ETUDIANT','étudiant'),
    )

    email=models.EmailField(unique=True)
    num_matricule=models.CharField(max_length=20, unique=True)
    matiere=models.CharField(max_length=100)

    role=models.CharField(max_length=20, choices=ROLE_CHOICE)
    

    def __str__(self):
        return self.username


    


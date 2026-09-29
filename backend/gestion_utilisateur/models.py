from django.db import models
from django.contrib.auth.models import AbstractUser

# Creation d'un login 

class CustomUser(AbstractUser):

    ROLE_CHOICE=(
        ('ETUDIANT','étudiant' ),
        ('ENSEIGNANT','enseignant'),
        ('ADMIN','administrateur'),
    )

    email=models.EmailField(unique=True)

    role=models.CharField(max_length=20, choices=ROLE_CHOICE)
    

    def __str__(self):
        return self.username


    


from django.db import models
from django.contrib.auth.models import AbstractUser

# Creation d'un table

class CustomUser(AbstractUser):

    ROLE_CHOICE=(
        ('ADMIN','administrateur' ),
        ('ENSEIGNANT','enseignant'),
        ('ETUDIANT','étudiant'),
    )

    NIVEAU_CHOICE=(
        ('L1','Licence 1'),
        ('L2','Licence 2'),
        ('L3','Licence 3'),
        ('M1', 'Master 1'),
        ('M2', 'Master 2'),
    )

    email=models.EmailField(unique=True)
    num_matricule=models.CharField(max_length=20, unique=True, blank=True, null=True)
    niveau=models.CharField(max_length=20, choices=NIVEAU_CHOICE, blank=True, null=True)
    role=models.CharField(max_length=20, choices=ROLE_CHOICE)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username


    


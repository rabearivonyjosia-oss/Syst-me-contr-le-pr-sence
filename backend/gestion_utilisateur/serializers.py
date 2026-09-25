from rest_framework import serializers
from .models import Enseignant, Etudiant, users
  
 #triate les demande opour l'API
  class usersSerializers(serializers.ModelSerializers):
     class Meta:
        model = users
        fields = '__all__'

    
class EtudiantSerializers(serializers,ModelSerializers):
       class Meta:
        model = Etudiant
        fields = '__all__'

class EnseignantSerializers(serializers,ModelSerializers):
    class Meta:
        models = Enseignant
        fields = '__all__'
        


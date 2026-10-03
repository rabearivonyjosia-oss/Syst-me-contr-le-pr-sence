from rest_framework import serializers
from .models import CustomUser
  
 #triate les demande opour l'API

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'role',
            'niveau',
            'num_matricule',
            'password',
        ]
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            niveau=validated_data['niveau'],
            num_matricule=validated_data['num_matricule'],
            password=validated_data['password']
        )
        return user
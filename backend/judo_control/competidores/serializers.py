from rest_framework import serializers
from .models import Competidor

class CompetidorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competidor
        fields = ['id', 'usuario', 'nombre', 'genero', 'division_peso', 'categoria', 'anos_experiencia', 'fecha_registro']
        read_only_fields = ['fecha_registro']
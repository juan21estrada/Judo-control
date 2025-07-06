from rest_framework import serializers
from .models import Competidor

class CompetidorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competidor
        fields = ['id', 'usuario', 'identificacion_personal', 'nombre', 'genero', 'division_peso', 'categoria', 'anos_experiencia', 'activo', 'fecha_registro']
        read_only_fields = ['fecha_registro']
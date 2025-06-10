from rest_framework import serializers
from .models import Competicion
from competidores.serializers import CompetidorSerializer

class CompeticionSerializer(serializers.ModelSerializer):
    competidores = CompetidorSerializer(many=True, read_only=True)
    creado_por_nombre = serializers.CharField(source='creado_por.nombre', read_only=True)

    class Meta:
        model = Competicion
        fields = ['id', 'nombre', 'fecha', 'evento', 'tipo', 'cantidad_atletas', 
                  'cantidad_combates_planificados', 'cantidad_combates_realizados', 
                  'finalizada', 'creado_por', 'creado_por_nombre', 'fecha_creacion', 'competidores']
        read_only_fields = ['fecha_creacion', 'cantidad_combates_realizados', 'creado_por', 'creado_por_nombre']